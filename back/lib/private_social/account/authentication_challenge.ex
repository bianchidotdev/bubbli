defmodule PrivateSocial.Account.AuthenticationChallenge do
  use Ecto.Schema
  import Ecto.Changeset

  schema "authentication_challenges" do
    field :challenge_string, :string
    field :expires_at, :utc_datetime

    timestamps()

    belongs_to :user, PrivateSocial.Account.User, type: :binary_id, primary_key: true
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:challenge_string, :expires_at, :user_id])
    |> validate_required([:challenge_string, :expires_at, :user_id])
    |> foreign_key_constraint(:user_id)
  end
end
