defmodule BubbliSchema.Post do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{
          id: binary(),
          deleted_at: NaiveDateTime.t(),
          protected_content: String.t(),
          author: BubbliSchema.User.t(),
          # comments: [BubbliSchema.Comment.t()],
          # attachments: [BubbliSchema.Attachment.t()],
          # reactions: [BubbliSchema.Reaction.t()],
          inserted_at: NaiveDateTime.t(),
          updated_at: NaiveDateTime.t()
        }

  # @derive {
  #   Flop.Schema,
  #   filterable: [:author, :timeline],
  #   sortable: [:inserted_at]
  # }

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "posts" do
    field(:deleted_at, :utc_datetime)
    field(:protected_content, :string)
    # TODO: migrate encrypted content to remote storage + store references

    timestamps()

    belongs_to(:author, BubbliSchema.User, type: :binary_id, primary_key: true)
    belongs_to(:timeline, BubbliSchema.Timeline, type: :binary_id, primary_key: true)
    # has_many(:comments, BubbliSchema.Comment, on_delete: :delete_all)
    # has_many(:attachments, BubbliSchema.Attachment, on_delete: :delete_all)
    # many_to_many(:keywords, BubbliSchema.Keyword, join_through: "posts_keywords")
  end

  def changeset(post, attrs) do
    post
    |> cast(attrs, [:protected_content, :author_id, :timeline_id])
    |> validate_required([:protected_content, :author_id, :timeline_id])
    |> foreign_key_constraint(:author_id)
    |> foreign_key_constraint(:timeline_id)
  end
end
