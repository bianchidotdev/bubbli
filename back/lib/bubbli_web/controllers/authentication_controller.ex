defmodule BubbliWeb.AuthenticationController do
  use BubbliWeb, :controller

  alias Bubbli.Account

  require Logger

  action_fallback(BubbliWeb.FallbackController)

  def signin(conn, %{"email" => email, "master_password_hash" => pw_hash}) do
    with {:ok, user} <- Account.get_user_by(email: email),
         {:ok, ^user} <- Account.verify_user(user, pw_hash),
         token <- BubbliWeb.Token.sign(%{user_id: user.id}) do
      conn
      |> put_status(:ok)
      |> put_resp_header("authorization", token)
      |> render(:successfully_authenticated, user: user)
    else
      {:error, :user_not_found} ->
        conn |> put_status(404) |> render(:failed_login, error: :user_not_found)

      {:error, error} ->
        Logger.warning("failed login - #{inspect(error)}")
        conn |> put_status(400) |> render(:failed_login, error: :unknown)
    end
  end

  def start(conn, %{"email" => email}) do
    with {:ok, user} <- Account.get_user_by(email: email) do
      conn
      |> put_status(:ok)
      |> render(:user_found, user: user)
    else
      _ -> conn |> put_status(404) |> render(:user_not_found)
    end
  end

  def verify(conn, %{
        "email" => email,
        "master_password_hash" => pw_hash,
        "client_key_type" => client_key_type
      }) do
    with {:ok, user} <- Account.get_user_by(email: email),
         :ok <- Account.verify_user(user, pw_hash),
         {:ok, client_key} <- Account.get_client_key_by_user_and_type(user, client_key_type),
         token <-
           BubbliWeb.Token.sign(%{user_id: user.id}) do
      conn
      |> put_status(:ok)
      |> Plug.Conn.put_resp_cookie("authorization", token,
        http_only: true,
        same_site: "Strict",
        secure: true,
        max_age: 60 * 60 * 24
      )
      |> render(:successfully_authenticated, user: user, client_key: client_key)
    else
      # make meaningful error
      {:error, error} ->
        Logger.warning("Failed authentication #{error}")
        conn |> put_status(400) |> render(:failed_login, error: error)

      error ->
        Logger.warning("Failed authentication #{error}")
        conn |> put_status(400) |> render(:failed_login, error: "Invalid authentication")
    end
  end

  def logout(conn, _) do
    conn
    |> put_status(:ok)
    |> put_resp_cookie("authorization", "",
      http_only: true,
      same_site: "Strict",
      secure: true,
      max_age: 0
    )
    |> render(:logout)
  end
end
