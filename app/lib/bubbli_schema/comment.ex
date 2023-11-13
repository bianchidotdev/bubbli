defmodule BubbliSchema.Comment do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{
          id: binary(),
          deleted_at: NaiveDateTime.t(),
          content: String.t(),
          user: BubbliSchema.User.t(),
          post: BubbliSchema.Post.t(),
          inserted_at: NaiveDateTime.t(),
          updated_at: NaiveDateTime.t()
        }

  @primary_key {:id, :binary_id, autogenerate: true}

  schema "comments" do
    field(:deleted_at, :utc_datetime)
    field(:content, :string)

    timestamps()

    belongs_to(:user, BubbliSchema.User, type: :binary_id, primary_key: true)
    belongs_to(:post, BubbliSchema.Post, type: :binary_id, primary_key: true)
  end

  @doc false
  def changeset(comment, attrs) do
    comment
    |> cast(attrs, [:content, :user_id, :post_id])
    |> validate_required([:content, :user_id, :post_id])
    |> foreign_key_constraint(:user_id)
    |> foreign_key_constraint(:post_id)
  end
end
