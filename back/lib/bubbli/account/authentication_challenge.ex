defmodule Bubbli.Account.AuthenticationChallenge do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  schema "authentication_challenges" do
    field :challenge_string, :string
    field :expires_at, :utc_datetime
    field :email, :string

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:challenge_string, :expires_at, :email])
    |> validate_required([:challenge_string, :expires_at, :email])
    # Check that email is valid
    |> validate_format(:email, ~r/@/)
    |> foreign_key_constraint(:user_id)
  end
end
