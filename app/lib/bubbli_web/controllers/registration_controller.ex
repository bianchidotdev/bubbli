defmodule BubbliWeb.RegistrationController do
  use BubbliWeb, :controller

  import Ecto.Changeset

  alias BubbliWeb.Base64EncodedBinary

  require Logger

  action_fallback(BubbliWeb.FallbackController)

  def test(conn, _) do
    conn |> put_status(:ok) |> render(:authenticated, current_user: conn.assigns[:current_user])
  end

  def register(conn, params) do
    types = %{
      email: :string,
      display_name: :string,
      username: :string,
      public_key: :string,
      client_keys: {:array, :map},
      timeline_key: {:map, :string},
      master_password_hash: Base64EncodedBinary
    }

    {%{}, types}
    |> cast(params, Map.keys(types))
    |> validate_required(~w/email display_name username public_key client_keys timeline_key master_password_hash/a)
    |> cast_client_keys()
    |> cast_timeline_key()
    |> apply_action(:insert)
    |> case do
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
                 client_keys: normalized_input.client_keys,
                 timeline_key_map: normalized_input.timeline_key,
                 master_password_hash: normalized_input.master_password_hash
               }),
             Logger.info("Successfully created user"),
             token <- BubbliWeb.Token.sign(%{user_id: user.id}) do
          conn
          |> Plug.Conn.put_resp_cookie("authorization", token,
            http_only: true,
            same_site: "Strict",
            secure: true,
            max_age: 60 * 60 * 24
          )
          |> put_status(200)
          |> render(:successfully_registered, user_id: user.id)
        else
          {:valid_public_key_check, :error} ->
            conn |> put_status(400) |> render(:invalid_public_key)

          {:user_exists_check, true} ->
            conn |> put_status(409) |> render(:user_exists)

          whoops ->
            Logger.error("Unexpected error: #{inspect(whoops)}")
            conn |> put_status(500) |> put_view(json: BubbliWeb.ErrorJSON) |> render(:"500")
        end

      {:error, changeset} ->
        conn
        |> put_status(400)
        |> put_view(json: BubbliWeb.ErrorJSON)
        |> render(:"400", changeset: changeset)
    end
  end

  defp cast_client_keys(%{valid?: false} = changeset), do: changeset

  defp cast_client_keys(changeset) do
    client_keys = get_field(changeset, :client_keys)

    client_key_changesets = Enum.map(client_keys, &cast_client_key/1)

    if Enum.any?(client_key_changesets, fn cs -> !cs.valid? end) do
      add_error(changeset, :client_keys, "contains invalid keys")
    else
      put_change(changeset, :client_keys, Enum.map(client_key_changesets, fn cs -> cs.changes end))
    end
  end

  defp cast_client_key(client_key) do
    types = %{
      protected_private_key: Base64EncodedBinary,
      encryption_iv: Base64EncodedBinary,
      type: :string
    }

    changeset =
      {%{}, types}
      |> Ecto.Changeset.cast(client_key, Map.keys(types))
      |> Ecto.Changeset.validate_required(Map.keys(types))

    changeset
  end

  defp cast_timeline_key(%{valid?: false} = changeset), do: changeset

  defp cast_timeline_key(changeset) do
    timeline_key = get_field(changeset, :timeline_key)

    types = %{
      encryption_iv: Base64EncodedBinary,
      protected_encryption_key: Base64EncodedBinary
    }

    timeline_changeset =
      {%{}, types}
      |> Ecto.Changeset.cast(timeline_key, Map.keys(types))
      |> Ecto.Changeset.validate_required(Map.keys(types))

    Logger.error(timeline_changeset.errors)

    put_change(changeset, :timeline_key, timeline_changeset.changes)
  end

  defp validate_public_key(public_PEM) do
    # TODO(bianchi): move to independent module
    #        # erlang :public_key expects a DER encoded signature as opposed to the raw bytes
    #        # https://elixirforum.com/t/verifying-web-crypto-signatures-in-erlang-elixir/20727/2
    with [key_entry] <- :public_key.pem_decode(public_PEM),
         public_key <- :public_key.pem_entry_decode(key_entry),
         false <- is_nil(public_key) do
      :ok
    else
      error ->
        Logger.warning("Invalid public key - error: #{error}")
        :error
    end
  end
end
