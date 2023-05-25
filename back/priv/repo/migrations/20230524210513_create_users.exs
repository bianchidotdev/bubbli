defmodule PrivateSocial.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do
    create table(:users, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :email, :string, null: false
      add :is_active, :boolean, default: false, null: false

      # cryptography
      # NOTE(bianchi): stored as binary blogs (independent of encoding)
      add :encrypted_master_private_key, :bytea
      add :master_public_key, :bytea
      add :salt, :bytea

      # user attributes
      add :display_name, :string
      add :first_name, :string
      add :last_name, :string
      # additional profile deets?

      timestamps()
    end

    create unique_index(:users, [:email])
  end
end
