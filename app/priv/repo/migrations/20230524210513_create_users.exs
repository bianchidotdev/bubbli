defmodule Bubbli.Repo.Migrations.CreateUsers do
  use Ecto.Migration

  def change do

    create table(:users, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:email, :string, null: false)
      add(:is_active, :boolean, default: false, null: false)

      # cryptography
      # NOTE(bianchi): stored as binary blogs (independent of encoding)
      add(:master_public_key, :bytea)
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
