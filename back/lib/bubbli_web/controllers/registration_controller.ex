defmodule BubbliWeb.RegistrationController do
  require Logger

  use BubbliWeb, :controller

  alias Bubbli.Account

  action_fallback BubbliWeb.FallbackController

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
    {:ok, challenge} = Account.get_auth_challenge(email, challenge_string)

    case valid_signature?(challenge_string, encoded_signature, public_PEM) do
      false ->
        conn |> put_status(400) |> put_view(json: BubbliWeb.ErrorJSON) |> render(:"400")

      true ->
        Logger.info("Signature verified - creating user")

        {:ok, user} =
          Account.create_user(%{
            email: email,
            first_name: first_name,
            public_key: public_PEM,
            encrypted_private_key: encrypted_private_key, # TODO(bianchi): change into map
            salt: salt
          })

        # TODO(bianchi): create client keys
        conn |> put_status(200) |> render(:successfully_authenticated)
    end
  end

  # TODO(bianchi): move to independent module
  defp valid_signature?(challenge_string, encoded_signature, public_PEM) do
    {:ok, raw_signature} = Base.decode64(encoded_signature)
    # erlang :public_key expects a DER encoded signature as opposed to the raw bytes
    # https://elixirforum.com/t/verifying-web-crypto-signatures-in-erlang-elixir/20727/2
    signature = Bubbli.ECDSASignature.new(raw_signature) |> Bubbli.ECDSASignature.to_der()

    [key_entry] = :public_key.pem_decode(public_PEM)
    public_key = :public_key.pem_entry_decode(key_entry)

    :public_key.verify(
      challenge_string,
      :sha384,
      signature,
      public_key
    )
  end
end
