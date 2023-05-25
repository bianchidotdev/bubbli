defmodule PrivateSocial.Repo.Migrations.AddAuthenticationChallengeTable do
  use Ecto.Migration

  def change do
    create table(:authentication_challenges) do
      add :challenge_string, :string, null: false
      add :expires_at, :utc_datetime, null: false

      timestamps()

      add :user_id, references(:users, type: :uuid), null: false
    end

    create index(:authentication_challenges, [:user_id])
  end
end
