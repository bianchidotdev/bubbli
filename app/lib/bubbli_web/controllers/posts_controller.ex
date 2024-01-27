defmodule BubbliWeb.PostController do
  use BubbliWeb, :controller

  import Ecto.Changeset

  alias BubbliWeb.Base64EncodedBinary

  require Logger

  action_fallback BubbliWeb.FallbackController

  def create(conn, params) do
    user = conn.assigns[:current_user]

    types = %{
      timeline_id: :string,
      # TODO: maybe content is treated as just an attachment? <- I think not
      protected_content: Base64EncodedBinary,
      encryption_algorithm: :map
      # TODO: attachments
    }

    {%{}, types}
    |> cast(params, Map.keys(types))
    |> validate_required(~w/timeline_id protected_content encryption_algorithm/a)
    |> apply_action(:insert)
    |> case do
      {:ok, normalized_input} ->
        Logger.info("normalized_input: #{inspect(normalized_input)}")
        Logger.debug("user: #{inspect(user)}")

        {:ok, post} =
          Bubbli.Posts.create_post(%{
            protected_content: normalized_input.protected_content,
            encryption_algorithm: normalized_input.encryption_algorithm,
            author_id: user.id,
            timeline_id: normalized_input.timeline_id
          })

        conn
        |> put_status(:ok)
        |> render(:successfully_created, %{post: post, timeline: post.timeline, author: user})

      {:error, changeset} ->
        conn
        |> put_status(400)
        |> put_view(json: BubbliWeb.ErrorJSON)
        |> render(:"400", changeset: changeset)
    end
  end
end
