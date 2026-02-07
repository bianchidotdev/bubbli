defmodule BubbliWeb.AuthController do
  use BubbliWeb, :controller

  @doc """
  Request a magic link email.

  POST /api/auth/magic-link/request
  Body: {"email": "user@example.com"}
  """
  def request_magic_link(conn, %{"email" => email}) do
    # This action sends the magic link email via the configured sender.
    # It succeeds even if the email doesn't exist (to prevent enumeration).
    Bubbli.Accounts.User
    |> Ash.ActionInput.for_action(:request_magic_link, %{email: email})
    |> Ash.run_action()

    conn
    |> put_status(200)
    |> json(%{ok: true, message: "If an account exists, a magic link has been sent."})
  end

  def request_magic_link(conn, _params) do
    conn
    |> put_status(422)
    |> json(%{error: "email is required"})
  end

  @doc """
  Exchange a magic link token for a session token.

  POST /api/auth/magic-link/callback
  Body: {"token": "..."}
  """
  def callback(conn, %{"token" => token} = params) do
    remember_me = Map.get(params, "remember_me", false)

    case Bubbli.Accounts.User
         |> Ash.Changeset.for_create(:sign_in_with_magic_link, %{
           token: token,
           remember_me: remember_me
         })
         |> Ash.create() do
      {:ok, user} ->
        bearer_token = user.__metadata__.token

        conn
        |> put_status(200)
        |> json(%{
          user: user_json(user),
          token: bearer_token
        })

      {:error, _error} ->
        conn
        |> put_status(401)
        |> json(%{error: "Invalid or expired magic link token."})
    end
  end

  def callback(conn, _params) do
    conn
    |> put_status(422)
    |> json(%{error: "token is required"})
  end

  @doc """
  Get the currently authenticated user.

  GET /api/auth/me
  Headers: Authorization: Bearer <token>
  """
  def me(conn, _params) do
    case conn.assigns[:current_user] do
      nil ->
        conn
        |> put_status(401)
        |> json(%{error: "Not authenticated"})

      user ->
        conn
        |> put_status(200)
        |> json(%{user: user_json(user)})
    end
  end

  @doc """
  Sign out the current user by revoking their token.

  POST /api/auth/sign-out
  Headers: Authorization: Bearer <token>
  """
  def sign_out(conn, _params) do
    case conn.assigns[:current_user] do
      nil ->
        conn
        |> put_status(200)
        |> json(%{ok: true})

      user ->
        token =
          conn
          |> Plug.Conn.get_req_header("authorization")
          |> List.first()
          |> case do
            "Bearer " <> token -> token
            _ -> nil
          end

        if token do
          Bubbli.Accounts.Token
          |> Ash.Changeset.for_create(:revoke_token, %{token: token}, context: %{user: user})
          |> Ash.create(authorize?: false)
        end

        conn
        |> put_status(200)
        |> json(%{ok: true})
    end
  end

  defp user_json(user) do
    %{
      id: user.id,
      email: to_string(user.email),
      display_name: user.display_name,
      handle: user.handle,
      bio: user.bio,
      avatar_url: user.avatar_url,
      profile_visibility: user.profile_visibility,
      comment_visibility: user.comment_visibility,
      inserted_at: user.inserted_at,
      updated_at: user.updated_at
    }
  end
end
