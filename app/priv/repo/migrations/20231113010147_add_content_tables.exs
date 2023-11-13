defmodule Bubbli.Repo.Migrations.AddContentTables do
  use Ecto.Migration

  def change do
    create table(:posts, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:deleted_at, :utc_datetime)

      add(:content, :bytea, null: false)
      add(:user_id, references(:users, type: :uuid), null: false)

      timestamps()
    end

    create index(:posts, [:user_id])

    create table(:comments, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:deleted_at, :utc_datetime)

      add(:content, :bytea, null: false)

      add(:post_id, references(:posts, type: :uuid), null: false)
      add(:user_id, references(:users, type: :uuid), null: false)

      timestamps()
    end

    create index(:comments, [:post_id])
    create index(:comments, [:user_id])

    create table(:attachments, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:deleted_at, :utc_datetime)

      add(:content, :bytea, null: false)
      add(:content_type, :string, null: false)
      add(:content_length, :integer, null: false)

      add(:post_id, references(:posts, type: :uuid))
      add(:comment_id, references(:comments, type: :uuid))
      add(:user_id, references(:users, type: :uuid))

      timestamps()
    end

    create index(:attachments, [:post_id])
    create index(:attachments, [:comment_id])
    create index(:attachments, [:user_id])

    create table(:reactions, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add(:reaction_type, :string, null: false)
      add(:reactable_id, :uuid)
      add(:reactable_type, :string)

      add(:user_id, references(:users, type: :uuid), null: false)

      timestamps()
    end

    create index(:reactions, [:reactable_id, :reactable_type])
    create index(:reactions, [:user_id])

    create table(:keywords, primary_key: false) do
      add(:id, :uuid, primary_key: true)
      add :name, :string

      timestamps()
    end

    create table(:post_keywords) do
      add :post_id, references(:posts, type: :uuid)
      add :keyword_id, references(:keywords, type: :uuid)

      timestamps()
    end

    create index(:post_keywords, [:post_id])
    create index(:post_keywords, [:keyword_id])
  end
end
