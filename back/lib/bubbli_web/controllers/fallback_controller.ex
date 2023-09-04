defmodule BubbliWeb.FallbackController do
  @moduledoc """
  Translates controller action results into valid `Plug.Conn` responses.

  See `Phoenix.Controller.action_fallback/1` for more details.
  """
  use BubbliWeb, :controller

  # This clause handles errors returned by Ecto's insert/update/delete.
  def call(conn, {:error, %Ecto.Changeset{} = changeset}) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: BubbliWeb.ChangesetJSON)
    |> render(:error, changeset: changeset)
  end

  # This clause is an example of how to handle resources that cannot be found.
  def call(conn, {:error, :not_found}) do
    conn
    |> put_status(:not_found)
    |> put_view(html: BubbliWeb.ErrorHTML, json: BubbliWeb.ErrorJSON)
    |> render(:"404")
  end

  def call(conn, {:error, :bad_request, error}) do
    conn
    |> put_status(:bad_request)
    |> put_view(html: BubbliWeb.ErrorHTML, json: BubbliWeb.ErrorJSON)
    |> render(:"400", error: error)
  end
end
