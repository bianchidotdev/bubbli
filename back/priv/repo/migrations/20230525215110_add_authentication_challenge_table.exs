defmodule PrivateSocial.Repo.Migrations.AddAuthenticationChallengeTable do
  use Ecto.Migration

  def change do
    create table(:authentication_challenges) do
      add :challenge_string, :string, null: false
      add :expires_at, :utc_datetime, null: false
      add :email, :string, null: false

      timestamps()
    end

    create index(:authentication_challenges, [:email])
  end
end
