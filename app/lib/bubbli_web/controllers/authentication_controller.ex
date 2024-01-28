defmodule BubbliWeb.AuthenticationController do
  use BubbliWeb, :controller

  import Ecto.Changeset

  alias BubbliWeb.Base64EncodedBinary

  require Logger

  action_fallback(BubbliWeb.FallbackController)

  def login(conn, params) do
    types = %{
      email: :string,
      client_key_type: :string,
      root_password_hash: Base64EncodedBinary
    }

    {%{}, types}
    |> cast(params, Map.keys(types))
    |> validate_required(~w/email client_key_type root_password_hash/a)
    |> apply_action(:insert)
    |> case do
      {:ok, normalized_input} ->
        with {:ok, user} <- Bubbli.get_user_by(email: normalized_input.email),
             :ok <- Bubbli.verify_user(user, normalized_input.root_password_hash),
             {:ok, client_key} <- Bubbli.get_client_key_by_user_and_type(user, normalized_input.client_key_type),
             encryption_keys <- Bubbli.get_encryption_keys_by_user(user.id),
             token <- Bubbli.create_user_api_token(user) do
          conn
          |> put_status(:ok)
          |> Plug.Conn.put_resp_cookie("authorization", token,
            http_only: true,
            same_site: "Strict",
            secure: true,
            max_age: 60 * 60 * 24
          )
          |> render(:successfully_authenticated, %{user: user, client_key: client_key, encryption_keys: encryption_keys})
        else
          {:error, :user_not_found} ->
            conn |> put_status(404) |> render(:failed_login, error: :user_not_found)

          {:error, error} ->
            Logger.warning("failed login - #{inspect(error)}")
            conn |> put_status(400) |> render(:failed_login, error: :unknown)
        end

      {:error, changeset} ->
        conn
        |> put_status(400)
        |> put_view(json: BubbliWeb.ErrorJSON)
        |> render(:"400", changeset: changeset)
    end
  end

  # def logout(conn, _) do
  #   conn
  #   |> put_status(:ok)
  #   |> BubbliWeb.UserAuth.log_out_user()
  #   # |> put_resp_cookie("authorization", "",
  #   #   http_only: true,
  #   #   same_site: "Strict",
  #   #   secure: true,
  #   #   max_age: 0
  #   # )
  #   |> render(:logout)
  # end
end
