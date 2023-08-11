defmodule BubbliWeb.RegistrationController do
  require Logger

  use BubbliWeb, :controller

  alias Bubbli.Account

  action_fallback BubbliWeb.FallbackController

  def test(conn, _) do
    conn |> put_status(:ok) |> render(:authenticated, current_user: conn.assigns[:current_user])
  end

  def start(conn, %{"email" => email}) do
    case Account.user_exists?(email) do
      true ->
        conn |> put_status(409) |> render(:user_exists)

      false ->
        {:ok, challenge} = Account.create_auth_challenge(email)

        conn
        |> put_status(:ok)
        |> put_resp_header("location", ~p"/api/v1/registration/confirm")
        |> render(:init, challenge: challenge)
    end
  end

  def confirm(conn, %{
        "email" => email,
        "first_name" => first_name,
        "signed_challenge" => encoded_signature,
        "public_key" => public_PEM,
        "encrypted_private_key" => encrypted_private_key,
        "salt" => salt,
        "challenge" => challenge_string,
        "client_keys" => client_keys
      }) do
    dbg()

    with {:ok, _challenge} <- Account.get_auth_challenge(email, challenge_string),
         {:ok} <- validate_signature(challenge_string, encoded_signature, public_PEM) do
      Logger.info("Signature verified - creating user")
    else
      {:error, err} ->
        Logger.info("Bad request to registration: #{err}")
        conn |> put_status(400) |> put_view(json: BubbliWeb.ErrorJSON) |> render(:"400")
    end

    with {:ok, user} <-
           Account.create_user(%{
             email: email,
             first_name: first_name,
             public_key: public_PEM,
             # TODO(bianchi): change into map
             encrypted_private_key: encrypted_private_key,
             salt: salt
           }),
         # TODO(bianchi): create client keys
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
      whoops ->
        IO.inspect("Unexpected error: #{whoops}")
        conn |> put_status(500) |> put_view(json: BubbliWeb.ErrorJSON) |> render(:"500")
    end
  end

  # TODO(bianchi): move to independent module
  defp validate_signature(challenge_string, encoded_signature, public_PEM) do
    with {:is_base64, {:ok, raw_signature}} <- {:is_base64, Base.decode64(encoded_signature)},
         # erlang :public_key expects a DER encoded signature as opposed to the raw bytes
         # https://elixirforum.com/t/verifying-web-crypto-signatures-in-erlang-elixir/20727/2
         {:is_ecdsa_signature, signature} <-
           {:is_ecdsa_signature,
            Bubbli.ECDSASignature.new(raw_signature) |> Bubbli.ECDSASignature.to_der()},
         {:is_valid_pem, [key_entry]} <- {:is_valid_pem, :public_key.pem_decode(public_PEM)},
         {:is_public_key, public_key} <-
           {:is_public_key, :public_key.pem_entry_decode(key_entry)},
         {:is_valid_signature, true} <-
           {:is_valid_signature,
            :public_key.verify(
              challenge_string,
              :sha384,
              signature,
              public_key
            )} do
      {:ok}
    else
      {:is_valid_signature, false} -> {:error, :invalid_signature}
      {_, {:error, err}} -> {:error, err}
      _ -> {:error, :bad_request}
    end
  end
end
