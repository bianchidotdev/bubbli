defmodule PrivateSocialWeb.RegistrationController do
  use PrivateSocialWeb, :controller

  alias PrivateSocial.Account

  action_fallback PrivateSocialWeb.FallbackController

  def init(conn, %{"email" => email}) do
    case Account.user_exists?(email) do
      true -> conn |> put_status(409) |> render(:user_exists)
      false ->
        temp_user = Account.get_or_create_temp_user(email)
        {:ok, challenge} = Account.create_auth_challenge(email)
        conn
        |> put_status(:ok)
        |> put_resp_header("location", ~p"/api/v1/registration_confirm")
        |> render(:init, challenge: challenge, temp_user: temp_user)
    end
  end

  def confirm(_conn, %{}) do
  end
end
