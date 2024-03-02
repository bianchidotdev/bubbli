defmodule BubbliWeb.RegisterSchema do
  @moduledoc false
  use Ecto.Schema

  import Ecto.Changeset

  alias BubbliWeb.Base64EncodedBinary
  alias BubbliWeb.ClientKeySchema
  alias BubbliWeb.RegisterSchema
  alias BubbliWeb.TimelineKeySchema

  embedded_schema do
    field :email, :string
    field :display_name, :string
    field :username, :string
    field :public_key, :string
    embeds_many :client_keys, ClientKeySchema
    embeds_one :timeline_key, TimelineKeySchema
    field :root_password_hash, Base64EncodedBinary
  end

  def changeset(params) do
    %RegisterSchema{}
    |> Ecto.Changeset.cast(params, [
      :email,
      :display_name,
      :username,
      :public_key,
      :root_password_hash
    ])
    |> validate_required([:email, :display_name, :username, :public_key, :root_password_hash])
    |> cast_embed(:client_keys, with: &ClientKeySchema.changeset/2, required: true)
    |> cast_embed(:timeline_key, with: &TimelineKeySchema.changeset/2)
  end
end
