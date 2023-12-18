defmodule BubbliWeb.PostController do
  use BubbliWeb, :controller

  import Ecto.Changeset

  require Logger

  action_fallback BubbliWeb.FallbackController

  def create(conn, params) do
    user = conn.assigns[:current_user]

    types = %{
      timeline_id: :string,
      # TODO: maybe content is treated as just an attachment?
      protected_content: :string
      # TODO: attachments
    }

    {%{}, types}
    |> cast(params, Map.keys(types))
    |> validate_required(~w//a)
    |> apply_action(:insert)
    |> case do
      {:ok, normalized_input} ->
        # TODO create post
        Logger.info("normalized_input: #{inspect(normalized_input)}")
        Logger.debug("user: #{inspect(user)}")

        Bubbli.Posts.create_post(%{
          protected_content: normalized_input.protected_content,
          author_id: user.id,
          timeline_id: normalized_input.timeline_id
        })

        :ok

      {:error, changeset} ->
        conn
        |> put_status(400)
        |> put_view(json: BubbliWeb.ErrorJSON)
        |> render(:"400", changeset: changeset)
    end
  end
end
