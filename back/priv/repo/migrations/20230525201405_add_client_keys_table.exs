defmodule Bubbli.Repo.Migrations.AddClientKeysTable do
  use Ecto.Migration

  def change do
    create table(:client_keys, primary_key: false) do
      add :id, :uuid, primary_key: true
      add :type, :string
      add :public_key, :bytea
      add :name, :string

      add :user_id, references(:users, type: :uuid), null: false

      timestamps()
    end

    create index(:client_keys, [:user_id])
  end
end
