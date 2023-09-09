defmodule Bubbli.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    # ensure we can generate salts, etc. on the postgres side
    execute("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";")

    create table(:users, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:email, :string, null: false)
      add(:is_active, :boolean, default: false, null: false)

      # cryptography
      # TODO(bianchi): figure out how to store (ie. structure + encoding)
      # NOTE(bianchi): stored as binary blogs (independent of encoding)
      add(:master_public_key, :bytea)
      add(:salt, :bytea)
      add(:master_password_hash, :bytea)

      # user attributes
      add(:display_name, :string)
      add(:username, :string)
      # additional profile deets?

      timestamps()
    end

    create(unique_index(:users, [:email]))
    # TODO: fix index
    # create(index(:users, [:encrypted_master_private_keys], using: "GIN"))
  end
end
