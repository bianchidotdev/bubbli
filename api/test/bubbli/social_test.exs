defmodule Bubbli.SocialTest do
  use Bubbli.DataCase, async: true

  defp create_user(email) do
    Ash.Seed.seed!(Bubbli.Accounts.User, %{email: email})
  end

  defp create_post(author, audiences \\ [%{type: :connections}]) do
    Bubbli.Social.create_post!(%{body: "test post", audiences: audiences}, actor: author)
  end

  defp feed(actor) do
    {:ok, page} = Bubbli.Social.list_feed(actor: actor)
    page.results
  end

  # Seed a mutual connection as the two directional adjacency edges.
  defp connect(user_a, user_b) do
    Ash.Seed.seed!(Bubbli.Social.Connection, %{user_id: user_a.id, peer_id: user_b.id})
    Ash.Seed.seed!(Bubbli.Social.Connection, %{user_id: user_b.id, peer_id: user_a.id})
  end

  setup do
    %{
      author: create_user("author@test.com"),
      viewer: create_user("viewer@test.com"),
      stranger: create_user("stranger@test.com")
    }
  end

  describe "post creation" do
    test "creates audience rows matching input", %{author: author} do
      post =
        create_post(author, [%{type: :public}, %{type: :connections}])
        |> Ash.load!(:post_audiences, authorize?: false)

      types = post.post_audiences |> Enum.map(& &1.type) |> Enum.sort()
      assert types == [:connections, :public]
    end

    test "defaults to connections audience", %{author: author} do
      post = create_post(author) |> Ash.load!(:post_audiences, authorize?: false)
      assert [%{type: :connections}] = post.post_audiences
    end
  end

  describe "feed visibility" do
    test "private post visible only to author", %{author: author, viewer: viewer} do
      create_post(author, [%{type: :private}])

      assert [_] = feed(author)
      assert [] = feed(viewer)
    end

    test "public post visible to any user", %{author: author, viewer: viewer} do
      create_post(author, [%{type: :public}])
      assert [_] = feed(viewer)
    end

    test "connections post requires an established connection", %{
      author: author,
      viewer: viewer,
      stranger: stranger
    } do
      create_post(author, [%{type: :connections}])

      assert [] = feed(viewer)

      connect(author, viewer)

      assert [_] = feed(viewer)
      assert [] = feed(stranger)
    end

    test "circle post visible only to circle members", %{
      author: author,
      viewer: viewer,
      stranger: stranger
    } do
      connect(author, viewer)
      circle = Ash.Seed.seed!(Bubbli.Social.Circle, %{name: "Close Friends", owner_id: author.id})
      Ash.Seed.seed!(Bubbli.Social.CircleMember, %{circle_id: circle.id, user_id: viewer.id})

      create_post(author, [%{type: :circle, circle_id: circle.id}])

      assert [_] = feed(viewer)
      assert [] = feed(stranger)
    end

    test "group post visible only to group members", %{
      author: author,
      viewer: viewer,
      stranger: stranger
    } do
      group =
        Ash.Seed.seed!(Bubbli.Social.Group, %{
          name: "Book Club",
          owner_id: author.id,
          privacy: :public
        })

      Ash.Seed.seed!(Bubbli.Social.GroupMember, %{
        group_id: group.id,
        user_id: viewer.id,
        role: :member
      })

      create_post(author, [%{type: :group, group_id: group.id}])

      assert [_] = feed(viewer)
      assert [] = feed(stranger)
    end
  end

  describe "group creation" do
    test "owner is automatically added as admin member", %{author: author} do
      group = Bubbli.Social.create_group!(%{name: "My Group"}, actor: author)

      members =
        Bubbli.Social.GroupMember
        |> Ash.Query.do_filter(group_id: group.id)
        |> Ash.read!(authorize?: false)

      assert [member] = members
      assert member.user_id == author.id
      assert member.role == :admin
    end
  end

  describe "connection requests" do
    test "send creates a pending request", %{author: a, viewer: b} do
      assert {:ok, request} = Bubbli.Social.send_connection_request(b.id, actor: a)
      assert request.status == :pending
      assert request.requester_id == a.id
      assert request.receiver_id == b.id
    end

    test "cannot send a request to yourself", %{author: a} do
      assert {:error, _} = Bubbli.Social.send_connection_request(a.id, actor: a)
    end

    test "cannot send a duplicate pending request in either direction", %{author: a, viewer: b} do
      assert {:ok, _} = Bubbli.Social.send_connection_request(b.id, actor: a)
      assert {:error, _} = Bubbli.Social.send_connection_request(b.id, actor: a)
      assert {:error, _} = Bubbli.Social.send_connection_request(a.id, actor: b)
    end

    test "cannot send a request when already connected", %{author: a, viewer: b} do
      connect(a, b)
      assert {:error, _} = Bubbli.Social.send_connection_request(b.id, actor: a)
    end

    test "only the receiver can accept", %{author: a, viewer: b} do
      {:ok, request} = Bubbli.Social.send_connection_request(b.id, actor: a)
      assert {:error, _} = Bubbli.Social.accept_connection_request(request, actor: a)
    end

    test "accepting establishes a mutual connection", %{author: a, viewer: b} do
      {:ok, request} = Bubbli.Social.send_connection_request(b.id, actor: a)
      assert {:ok, accepted} = Bubbli.Social.accept_connection_request(request, actor: b)
      assert accepted.status == :accepted

      assert [%{peer_id: peer_a}] = Bubbli.Social.list_connections!(actor: a)
      assert peer_a == b.id
      assert [%{peer_id: peer_b}] = Bubbli.Social.list_connections!(actor: b)
      assert peer_b == a.id
    end

    test "requester can cancel and then re-request", %{author: a, viewer: b} do
      {:ok, request} = Bubbli.Social.send_connection_request(b.id, actor: a)
      assert {:ok, cancelled} = Bubbli.Social.cancel_connection_request(request, actor: a)
      assert cancelled.status == :cancelled
      assert {:ok, _} = Bubbli.Social.send_connection_request(b.id, actor: a)
    end

    test "rejecting does not block a future request", %{author: a, viewer: b} do
      {:ok, request} = Bubbli.Social.send_connection_request(b.id, actor: a)
      assert {:ok, rejected} = Bubbli.Social.reject_connection_request(request, actor: b)
      assert rejected.status == :rejected
      assert {:ok, _} = Bubbli.Social.send_connection_request(b.id, actor: a)
    end
  end

  describe "removing a connection" do
    test "deletes both edges and shared circle memberships", %{author: a, viewer: b} do
      connect(a, b)

      circle =
        Bubbli.Social.Circle
        |> Ash.Changeset.for_create(:create_custom, %{name: "Friends"}, actor: a)
        |> Ash.create!()

      Bubbli.Social.CircleMember
      |> Ash.Changeset.for_create(:add_member, %{circle_id: circle.id, user_id: b.id}, actor: a)
      |> Ash.create!()

      [edge] = Bubbli.Social.list_connections!(actor: a)
      assert :ok = Bubbli.Social.remove_connection(edge, actor: a)

      assert [] = Bubbli.Social.list_connections!(actor: a)
      assert [] = Bubbli.Social.list_connections!(actor: b)

      members = Bubbli.Social.CircleMember |> Ash.read!(authorize?: false)
      assert members == []
    end
  end

  describe "circle membership" do
    test "can only add users you are connected to", %{author: a, viewer: b, stranger: c} do
      circle =
        Bubbli.Social.Circle
        |> Ash.Changeset.for_create(:create_custom, %{name: "Friends"}, actor: a)
        |> Ash.create!()

      assert {:error, _} =
               Bubbli.Social.CircleMember
               |> Ash.Changeset.for_create(
                 :add_member,
                 %{circle_id: circle.id, user_id: c.id},
                 actor: a
               )
               |> Ash.create()

      connect(a, b)

      assert {:ok, _} =
               Bubbli.Social.CircleMember
               |> Ash.Changeset.for_create(
                 :add_member,
                 %{circle_id: circle.id, user_id: b.id},
                 actor: a
               )
               |> Ash.create()
    end
  end
end
