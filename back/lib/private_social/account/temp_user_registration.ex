defmodule PrivateSocial.Account.TempUserRegistration do
  use Ecto.Schema
  import Ecto.Changeset

  schema "temp_user_registrations" do
    field :expires_at, :utc_datetime
    field :email, :string
    field :salt, :string

    timestamps()
  end

  @doc false
  def changeset(user, attrs) do
    user
    |> cast(attrs, [:expires_at, :email])
    |> validate_required([:expires_at, :email])
    |> validate_format(:email, ~r/@/) # Check that email is valid
    |> unique_constraint(:email)
  end
end
