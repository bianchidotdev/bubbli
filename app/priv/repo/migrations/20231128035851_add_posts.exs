defmodule Bubbli.Repo.Migrations.AddPosts do
  use Ecto.Migration

  def change do
    create table(:posts, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:deleted_at, :utc_datetime)

      add(:content, :bytea, null: false)
      add(:author_id, references(:users, type: :uuid), null: false)
      add(:timeline_id, references(:timelines, type: :uuid), null: false)

      timestamps()
    end

    create index(:posts, [:author_id])
    create index(:posts, [:timeline_id])
  end
end
