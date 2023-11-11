defmodule BubbliWeb.RegistrationController do
  use BubbliWeb, :controller

  import Ecto.Changeset

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
      encrypted_user_encryption_key: :string,
      master_password_hash: :string
    }

    {%{}, types}
    |> cast(params, Map.keys(types))
    |> validate_required(
      ~w/email display_name username public_key client_keys encrypted_user_encryption_key master_password_hash/a
    )
    |> apply_action(:insert)
    |> case do
      {:ok, normalized_input} ->
        with {:ok, password_hash} <- Base.decode64(normalized_input.master_password_hash),
             {:valid_public_key_check, :ok} <-
               {:valid_public_key_check, validate_public_key(normalized_input.public_key)},
             {:user_exists_check, false} <- {:user_exists_check, Bubbli.user_exists?(normalized_input.email)},
             {:ok, user} <-
               Bubbli.register_user(%{
                 email: normalized_input.email,
                 display_name: normalized_input.display_name,
                 username: normalized_input.username,
                 master_public_key: normalized_input.public_key,
                 client_keys: normalized_input.client_keys,
                 encd_user_enc_key: normalized_input.encrypted_user_encryption_key,
                 master_password_hash: password_hash
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

  # NOTE(bianchi): removed due to using pbkdf-derived hash for authn instead
  # defp validate_signature(challenge_string, encoded_signature, public_PEM) do
  #   with {:is_base64, {:ok, raw_signature}} <- {:is_base64, Base.decode64(encoded_signature)},
  #        # erlang :public_key expects a DER encoded signature as opposed to the raw bytes
  #        # https://elixirforum.com/t/verifying-web-crypto-signatures-in-erlang-elixir/20727/2
  #        {:is_ecdsa_signature, signature} <-
  #          {:is_ecdsa_signature,
  #           raw_signature |> Bubbli.ECDSASignature.new() |> Bubbli.ECDSASignature.to_der()},
  #        {:is_valid_pem, [key_entry]} <- {:is_valid_pem, :public_key.pem_decode(public_PEM)},
  #        {:is_public_key, public_key} <-
  #          {:is_public_key, :public_key.pem_entry_decode(key_entry)},
  #        {:is_valid_signature, true} <-
  #          {:is_valid_signature,
  #           :public_key.verify(
  #             challenge_string,
  #             :sha384,
  #             signature,
  #             public_key
  #           )} do
  #     {:ok}
  #   else
  #     {:is_valid_signature, false} -> {:error, :invalid_signature}
  #     {_, {:error, err}} -> {:error, err}
  #     _ -> {:error, :bad_request}
  #   end
  # end
end
