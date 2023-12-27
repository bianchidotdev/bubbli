defmodule Bubbli.Repo.Migrations.CreateUsersAuthTables do
  use Ecto.Migration

  def change do
    execute "CREATE EXTENSION IF NOT EXISTS citext", ""
    # ensure we can generate salts, etc. on the postgres side
    execute("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";")

    create table(:users, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :email, :citext, null: false
      add :confirmed_at, :naive_datetime
      add :is_active, :boolean, default: false, null: false

      # user attributes
      add(:display_name, :string)
      add(:username, :string)

      # cryptography
      add :hashed_authentication_hash, :string, null: false
      # NOTE(bianchi): stored as binary blogs (independent of encoding)
      # TODO: move to separate table
      add(:master_public_key, :bytea)

      timestamps(type: :utc_datetime)
    end

    create unique_index(:users, [:email])

    create table(:users_tokens, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :user_id, references(:users, type: :binary_id, on_delete: :delete_all), null: false
      add :token, :binary, null: false
      add :context, :string, null: false
      add :sent_to, :string
      timestamps(updated_at: false)
    end

    create index(:users_tokens, [:user_id])
    create unique_index(:users_tokens, [:context, :token])
  end
end
