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

    test "connections post requires accepted connection", %{
      author: author,
      viewer: viewer,
      stranger: stranger
    } do
      create_post(author, [%{type: :connections}])

      assert [] = feed(viewer)

      Ash.Seed.seed!(Bubbli.Social.Connection, %{
        requester_id: author.id,
        receiver_id: viewer.id,
        status: :accepted
      })

      assert [_] = feed(viewer)
      assert [] = feed(stranger)
    end

    test "circle post visible only to circle members", %{
      author: author,
      viewer: viewer,
      stranger: stranger
    } do
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
end
