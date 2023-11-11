defmodule Bubbli.AccountsTest do
  use Bubbli.DataCase

  alias Bubbli.Accounts

  describe "users" do
    import Bubbli.AccountsFixtures

    alias BubbliSchema.User

    @create_attrs %{
      email: "testabcd@example.com",
      is_active: true,
      display_name: "test",
      master_public_key: "test",
      encrypted_master_private_keys: %{"test" => "test"},
      salt: "testtesttesttest",
      master_password_hash: "test"
    }
    @invalid_attrs %{email: nil, is_active: nil}

    test "list_users/0 returns all users" do
      user = user_fixture()
      assert Bubbli.list_users() == [user]
    end

    test "get_user!/1 returns the user with given id" do
      user = user_fixture()
      assert Bubbli.get_user!(user.id) == user
    end

    test "create_user/1 with valid data creates a user" do
      assert {:ok, %User{} = user} = Bubbli.create_user(@create_attrs)
      assert user.email == "testabcd@example.com"
      assert user.is_active == true
    end

    test "create_user/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Bubbli.create_user(@invalid_attrs)
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
end
