defmodule Bubbli.PostsTest do
  use Bubbli.DataCase

  alias Bubbli.Factory
  alias Bubbli.Posts

  setup do
    user = BubbliFixtures.AccountsFixtures.user_registration_fixture()
    user = Repo.preload(user, :home_timeline)
    post = Factory.insert!(:post, author_id: user.id, timeline_id: user.home_timeline.id)
    {:ok, user: user, post: post}

    {:ok, %{post: post, user: user}}
  end

  test "fails creating post with missing attributes" do
    post_attrs = %{protected_content: Faker.Lorem.paragraph()}
    assert {:error, %{valid?: false}} = Posts.create_post(post_attrs)
  end

  test "create valid post", ctx do
    post_attrs = %{
      protected_content: Faker.Lorem.paragraph(),
      author_id: ctx.user.id,
      timeline_id: ctx.user.home_timeline.id,
      encryption_algorithm: %{}
    }

    assert {:ok, _post} = Posts.create_post(post_attrs)
  end

  test "create deleted post", ctx do
    post_attrs = %{
      protected_content: Faker.Lorem.paragraph(),
      author_id: ctx.user.id,
      timeline_id: ctx.user.home_timeline.id,
      deleted_at: DateTime.truncate(DateTime.utc_now(), :second),
      encryption_algorithm: %{}
    }

    assert {:ok, _post} = Posts.create_post(post_attrs)
  end

  test "fails to create post with invalid author", ctx do
    post_attrs = %{
      protected_content: Faker.Lorem.paragraph(),
      author_id: Faker.UUID.v4(),
      timeline_id: ctx.user.home_timeline.id,
      encryption_algorithm: %{}
    }

    assert {:error, changeset} = Posts.create_post(post_attrs)
    assert {"does not exist", _} = changeset.errors[:author_id]
  end

  test "fails to create post with invalid timeline", ctx do
    post_attrs = %{
      protected_content: Faker.Lorem.paragraph(),
      author_id: ctx.user.id,
      encryption_algorithm: %{},
      timeline_id: Faker.UUID.v4()
    }

    assert {:error, changeset} = Posts.create_post(post_attrs)
    assert {"does not exist", _} = changeset.errors[:timeline_id]
  end

  test "fails to create post with invalid protected_content", ctx do
    post_attrs = %{author_id: ctx.user.id, timeline_id: ctx.user.home_timeline.id, protected_content: nil}
    assert {:error, changeset} = Posts.create_post(post_attrs)
    assert {"can't be blank", _} = changeset.errors[:protected_content]
  end
end
