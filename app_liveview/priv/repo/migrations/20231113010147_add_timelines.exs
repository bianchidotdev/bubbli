defmodule Bubbli.Repo.Migrations.AddTimelines do
  use Ecto.Migration

  def change do
    # belongs_to users or groups
    create table(:timelines, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:type, :string, null: false)
      add(:user_id, references(:users, type: :uuid))
      # add(:group_id, references(:groups, type: :uuid))

      timestamps()
    end

    create index(:timelines, [:user_id])
    # create index(:timelines, [:group_id])
    # belongs_to timelines or chats
    # I feel like this is a useful construct but I can't think of it's use case
    # right now. I'll keep it in here because it's not causing harm
    create table(:encryption_contexts, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:timeline_id, references(:timelines, type: :uuid), null: false)

      timestamps()
    end

    create table(:encryption_keys, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:encryption_iv, :bytea, null: false)
      add(:protected_encryption_key, :bytea, null: false)

      add(:user_id, references(:users, type: :uuid), null: false)
      add(:encryption_context_id, references(:encryption_contexts, type: :uuid), null: false)

      timestamps()
    end

    create index(:encryption_keys, [:user_id])
    create index(:encryption_keys, [:user_id, :encryption_context_id])
  end
end
