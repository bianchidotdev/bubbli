defmodule PrivateSocial.AccountFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `PrivateSocial.Account` context.
  """

  @doc """
  Generate a unique user email.
  """
  def unique_user_email, do: "someemail#{System.unique_integer([:positive])}@example.com"

  @doc """
  Generate a user.
  """
  def user_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> Enum.into(%{
        email: unique_user_email(),
        is_active: true,
        salt: "testsalt"
      })
      |> PrivateSocial.Account.create_user()
    user
  end
end
