defmodule PrivateSocial.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    # ensure we can generate salts, etc. on the postgres side
    execute "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"

    create table(:users, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :email, :string, null: false
      add :is_active, :boolean, default: false, null: false

      # cryptography
      # TODO(bianchi): figure out how to store (ie. structure + encoding)
      add :encrypted_master_private_key, :map
      # NOTE(bianchi): stored as binary blogs (independent of encoding)
      add :master_public_key, :bytea
      add :salt, :text, null: false, default: fragment("gen_salt('bf')")

      # user attributes
      add :display_name, :string
      add :first_name, :string
      add :last_name, :string
      # additional profile deets?

      timestamps()
    end

    create unique_index(:users, [:email])
    create index(:users, [:encrypted_master_private_key], using: "GIN")
  end
end
