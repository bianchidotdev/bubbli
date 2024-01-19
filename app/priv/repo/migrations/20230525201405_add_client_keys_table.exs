defmodule Bubbli.Repo.Migrations.AddClientKeysTable do
  use Ecto.Migration

  def change do
    create table(:client_keys, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:type, :string, null: false)
      add(:key_algorithm, :jsonb, null: false)
      add(:wrap_algorithm, :jsonb, null: false)
      add(:key_usages, :jsonb, null: false)
      add(:protected_private_key, :bytea, null: false)

      add(:user_id, references(:users, type: :uuid), null: false)

      timestamps()
    end

    create(index(:client_keys, [:user_id]))
  end
end
