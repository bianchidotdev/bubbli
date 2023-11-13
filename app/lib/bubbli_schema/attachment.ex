defmodule BubbliSchema.Attachment do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  @type t :: %__MODULE__{
          id: binary(),
          content_type: String.t(),
          filename: String.t(),
          size: integer(),
          url: String.t(),
          user_id: binary(),
          post_id: binary(),
          comment_id: binary(),
          inserted_at: NaiveDateTime.t(),
          updated_at: NaiveDateTime.t()
        }

  schema "attachments" do
    field :content_type, :string
    field :filename, :string
    field :size, :integer
    field :url, :string
    field :user_id, :id
    field :post_id, :id
    field :comment_id, :id

    timestamps()
  end

  @doc false
  def changeset(attachment, attrs) do
    attachment
    |> cast(attrs, [:content_type, :filename, :size, :url, :user_id])
    |> validate_required([:content_type, :filename, :size, :url, :user_id])
  end
end
