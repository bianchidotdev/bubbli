defmodule Bubbli.Repo.Migrations.AddClientKeysTable do
  use Ecto.Migration

  def change do
    create table(:client_keys, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:type, :string, null: false)
      add(:encryption_iv, :bytea, null: false)
      add(:encrypted_private_key, :bytea, null: false)

      add(:user_id, references(:users, type: :uuid), null: false)

      timestamps()
    end

    create(index(:client_keys, [:user_id]))
  end
end
