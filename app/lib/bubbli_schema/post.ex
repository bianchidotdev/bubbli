defmodule BubbliSchema.Post do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{
          id: binary(),
          deleted_at: NaiveDateTime.t(),
          content: String.t(),
          user: BubbliSchema.User.t(),
          # comments: [BubbliSchema.Comment.t()],
          # attachments: [BubbliSchema.Attachment.t()],
          # reactions: [BubbliSchema.Reaction.t()],
          inserted_at: NaiveDateTime.t(),
          updated_at: NaiveDateTime.t()
        }

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "posts" do
    field(:deleted_at, :utc_datetime)
    field(:content, :string)

    timestamps()

    belongs_to(:user, BubbliSchema.User, type: :binary_id, primary_key: true, foreign_key: :author_id)
    # has_many(:comments, BubbliSchema.Comment, on_delete: :delete_all)
    # has_many(:attachments, BubbliSchema.Attachment, on_delete: :delete_all)
    # many_to_many(:keywords, BubbliSchema.Keyword, join_through: "posts_keywords")
  end

  def changeset(post, attrs) do
    post
    |> cast(attrs, [:content, :author_id, :timeline_id])
    |> validate_required([:content, :author_id, :timeline_id])
    |> foreign_key_constraint(:author_id)
    |> foreign_key_constraint(:timeline_id)
  end
end
