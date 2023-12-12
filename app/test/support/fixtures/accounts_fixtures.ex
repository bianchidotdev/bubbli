defmodule BubbliFixtures.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Bubbli.Accounts` context.
  """

  use Boundary, check: [in: false, out: false]

  @client_key_params [
    %{
      type: "password",
      protected_private_key: "foobar",
      encryption_iv: "foobar"
    }
  ]

  @doc """
  Generate a unique user email.
  """
  def unique_user_email, do: "someemail#{System.unique_integer([:positive])}@example.com"

  # TODO: refactor into Bubbli.Factory
  @doc """
  Generate a user.
  """
  def user_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> Enum.into(%{
        email: unique_user_email(),
        display_name: "test",
        username: "test",
        is_active: true,
        salt: "testsalt",
        master_password_hash: Base.encode64("foobar"),
        encrypted_master_private_keys: %{"ckey_1234" => "test"},
        master_public_key: "test"
      })
      |> Bubbli.Accounts.create_user()

    user
  end

  def user_registration_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> Enum.into(%{
        email: unique_user_email(),
        client_keys: @client_key_params,
        username: Faker.Internet.user_name(),
        display_name: "test mctesterson",
        salt: Argon2.Base.gen_salt(),
        master_password_hash: "foobar",
        master_public_key: sample_public_key(),
        timeline_key_map: %{
          encryption_iv: "test",
          protected_encryption_key: "test"
        }
      })
      |> Bubbli.Accounts.register_user()

    user
  end

  def sample_public_key do
    "-----BEGIN PUBLIC KEY-----\nMIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxKDgo5Kaz9FnPLdAHH73XX3abSde5p7iRKyPOYfXVTAdKRbWehH1esGm+grmjmqgo3FJKlLV8nN85OZYn+ktvsFXwjLRQYrG6zzsg0ke9RgMKfDW570TXaNYgXS1iEU9YB8LoCfbkFGzStxHjIIr8cB+sfFKd2xYFZ4yV7MpNEJ2LWX+uVE0HB/J4RYVBA7JS/YfDt1hDHL8UUhArVZv/3S2gfXjAhzfbZj1UJE1WnN2DMrrobnGToIVz//OD7i00bh61FYbqnS59HuKdWqXyRvJDaMcBaaAk6358NgsbOGRf6QLWieuQ7RAb88z8qklpQhuhUQhjZmNCREUKifpV58WFEd+59mGfRsJE84ejpbgZtrU8ZAY9k7pkdtfU8Wj9zILEObKLshHLy2QSNwwxy7WWNEFb3FKENFkUjh4HlGUHf9PSml03vujuOQFxtWOlxoR9hkha0Y7aK/2cHME4170fM0jxcXb4Hv9S3pJVmamQMPZPs/x6+0zXSHPDsrlL76AEj8nNlAZD6UQNcotuxR9GkKUjbPrQ35mrJpGOE0E6/Lo+8unaoSOJWEo65WV7P42V7oEifGRJ0J+IUVit8e5krEeFaZ6SbOhF3IP1TyHS+kfDiUdrl2Y3dMWFtAq8iOQ1Ea5hgq3i2uzHGjT+KVLjhCsBUT87zqck+hjid8CAwEAAQ==\n-----END PUBLIC KEY-----"
  end
end
