defmodule AuthenticationController do
  use BubbliWeb, :controller

  require Logger

  action_fallback BubbliWeb.FallbackController

  def init(conn, %{"email" => email}) do
    if Account.user_exists?(email) do
      {:ok, challenge} = Account.create_auth_challenge(email)

      conn
      |> put_status(:ok)
      |> put_resp_header("location", ~p"/api/v1/auth/login_verify")
      |> render(:init, challenge: challenge)
    else
      conn |> put_status(400) |> render(:user_not_found)
    end
  end

  def verify(conn, _) do
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
  end
end
