defmodule BubbliWeb.RegistrationController do
  use BubbliWeb, :controller

  import Ecto.Changeset

  require Logger

  action_fallback(BubbliWeb.FallbackController)

  def test(conn, _) do
    conn |> put_status(:ok) |> render(:authenticated, current_user: conn.assigns[:current_user])
  end

  def register(conn, params) do
    changeset = BubbliWeb.RegisterSchema.changeset(params)

    case apply_action(changeset, :insert) do
      {:ok, normalized_input} ->
        with {:valid_public_key_check, :ok} <-
               {:valid_public_key_check, validate_public_key(normalized_input.public_key)},
             {:user_exists_check, false} <- {:user_exists_check, Bubbli.user_exists?(normalized_input.email)},
             {:ok, user} <-
               Bubbli.register_user(%{
                 email: normalized_input.email,
                 display_name: normalized_input.display_name,
                 username: normalized_input.username,
                 master_public_key: normalized_input.public_key,
                 client_keys: Enum.map(normalized_input.client_keys, &Map.from_struct/1),
                 timeline_key_map: Map.from_struct(normalized_input.timeline_key),
                 root_password_hash: normalized_input.root_password_hash
               }) do
          Logger.info("Successfully created user - #{normalized_input.email}}")
          token = Bubbli.create_user_api_token(user)

          conn
          |> Plug.Conn.put_resp_cookie("authorization", token,
            http_only: true,
            same_site: "Strict",
            secure: true,
            max_age: 60 * 60 * 24
          )
          |> put_status(:ok)
          |> render(:successfully_registered, user: user)
        else
          {:valid_public_key_check, :error} ->
            conn |> put_status(400) |> render(:invalid_public_key)

          {:user_exists_check, true} ->
            conn |> put_status(409) |> render(:user_exists)

          whoops ->
            Logger.error("Unexpected error: #{inspect(whoops)}")
            conn |> put_status(500) |> put_view(json: BubbliWeb.ErrorJSON) |> render(:"500")
        end

      {:error, error} ->
        {:error, error}
    end
  end

  defp validate_public_key(public_PEM) do
    # TODO(bianchi): move to independent module
    #        # erlang :public_key expects a DER encoded signature as opposed to the raw bytes
    #        # https://elixirforum.com/t/verifying-web-crypto-signatures-in-erlang-elixir/20727/2
    with [key_entry] <- :public_key.pem_decode(public_PEM),
         public_key = :public_key.pem_entry_decode(key_entry),
         false <- is_nil(public_key) do
      :ok
    else
      error ->
        Logger.warning("Invalid public key - error: #{error}")
        :error
    end
  end
end
