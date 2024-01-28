defmodule Bubbli.AccountsTest do
  use Bubbli.DataCase

  import BubbliFixtures.AccountsFixtures

  alias BubbliSchema.User

  describe "users" do
    @create_attrs %{
      email: "testabcd@example.com",
      is_active: true,
      display_name: "test",
      username: "test",
      master_public_key: "test",
      client_keys: [],
      timeline_key_map: %{
        key_algorithm: %{},
        wrap_algorithm: %{},
        key_usages: [],
        protected_encryption_key: "test"
      },
      salt: "testtesttesttest",
      root_password_hash: "test"
    }
    @invalid_attrs %{email: nil, is_active: nil}

    test "list_users/0 returns all users" do
      user = user_fixture()
      assert Bubbli.list_users() == [user]
    end

    test "register_user/1 creates a user" do
      assert {:ok, %User{} = user} = Bubbli.register_user(@create_attrs)
      assert user == Bubbli.get_user!(user.id, [:home_timeline, home_timeline: :encryption_context])
    end

    test "get_user!/1 returns the user with given id" do
      user = user_fixture()
      assert Bubbli.get_user!(user.id) == user
    end

    test "update_user/2 with valid data updates the user" do
      user = user_fixture()
      update_attrs = %{email: "someupdated@email", is_active: false}

      assert {:ok, %User{} = user} = Bubbli.update_user(user, update_attrs)
      assert user.email == "someupdated@email"
      assert user.is_active == false
    end

    test "update_user/2 with invalid data returns error changeset" do
      user = user_fixture()
      assert {:error, %Ecto.Changeset{}} = Bubbli.update_user(user, @invalid_attrs)
      assert user == Bubbli.get_user!(user.id)
    end

    test "delete_user/1 deletes the user" do
      user = user_fixture()
      assert {:ok, %User{}} = Bubbli.delete_user(user)
      assert_raise Ecto.NoResultsError, fn -> Bubbli.get_user!(user.id) end
    end

    test "change_user/1 returns a user changeset" do
      user = user_fixture()
      assert %Ecto.Changeset{} = Bubbli.change_user(user)
    end
  end

  describe "create_user_api_token/1 and fetch_user_by_api_token/1" do
    test "creates and fetches by token" do
      user = user_fixture()
      token = Bubbli.create_user_api_token(user)
      assert {:ok, fetched_user} = Bubbli.fetch_user_by_api_token(token)
      assert fetched_user.id == user.id
      assert Bubbli.fetch_user_by_api_token("invalid") == :error
    end
  end
end
