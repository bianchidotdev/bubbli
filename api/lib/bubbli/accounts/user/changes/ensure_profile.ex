defmodule Bubbli.Accounts.User.Changes.EnsureProfile do
  @moduledoc """
  An after-action change that ensures a profile exists for a user.

  When a user is created (e.g. via magic link sign-in), this change
  checks whether a profile already exists and creates one if not.
  This guarantees every user always has an associated profile record.
  """

  use Ash.Resource.Change

  @impl true
  def change(changeset, _opts, _context) do
    Ash.Changeset.after_action(changeset, fn _changeset, user ->
      case Bubbli.Accounts.Profile
           |> Ash.Query.filter(user_id == ^user.id)
           |> Ash.read_one(authorize?: false) do
        {:ok, nil} ->
          Bubbli.Accounts.Profile
          |> Ash.Changeset.for_create(:create, %{user_id: user.id}, authorize?: false)
          |> Ash.create(authorize?: false)
          |> case do
            {:ok, _profile} -> {:ok, user}
            {:error, error} -> {:error, error}
          end

        {:ok, _profile} ->
          {:ok, user}

        {:error, error} ->
          {:error, error}
      end
    end)
  end
end
