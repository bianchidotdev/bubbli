defmodule BubbliWeb.UserSessionController do
  use BubbliWeb, :controller

  alias Bubbli.Accounts
  alias BubbliWeb.UserAuth

  def create(conn, %{"_action" => "registered"} = params) do
    create(conn, params, "Account created successfully!")
  end

  def create(conn, %{"_action" => "password_updated"} = params) do
    conn
    |> put_session(:user_return_to, ~p"/users/settings")
    |> create(params, "Password updated successfully!")
  end

  def create(conn, params) do
    create(conn, params, "Welcome back!")
  end

  defp create(conn, %{"user" => user_params}, info) do
    %{"email" => email, "authentication_hash" => authentication_hash} = user_params

    if user = Accounts.get_user_by_email_and_password(email, authentication_hash) do
      conn
      # |> put_flash(:info, info)
      |> UserAuth.log_in_user(user, user_params)
      |> json(%{message: info, user: %{email: user.email}})
    else
      # In order to prevent user enumeration attacks, don't disclose whether the email is registered.
      conn
      |> put_status(401)
      |> json(%{error: "Unauthorized"})

    end
  end

  def delete(conn, _params) do
    conn
    |> put_flash(:info, "Logged out successfully.")
    |> UserAuth.log_out_user()
  end
end