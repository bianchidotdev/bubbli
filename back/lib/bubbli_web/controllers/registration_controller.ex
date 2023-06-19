defmodule BubbliWeb.RegistrationController do
  use BubbliWeb, :controller

  alias Bubbli.Account

  action_fallback BubbliWeb.FallbackController

  def start(conn, %{"email" => email}) do
    case Account.user_exists?(email) do
      true -> conn |> put_status(409) |> render(:user_exists)
      false ->
        temp_user = Account.get_or_create_temp_user(email)
        {:ok, challenge} = Account.create_auth_challenge(email)
        conn
        |> put_status(:ok)
        |> put_resp_header("location", ~p"/api/v1/registration_finish")
        |> render(:init, challenge: challenge, temp_user: temp_user)
    end
  end

  def finish(_conn, %{"email" => email, "signed_challenge" => signed_challenge, "public_key" => public_PEM, "challenge" => challenge_string}) do
    {:ok, challenge} =  Account.get_auth_challenge(email, challenge_string)
#      {:ok, challenge} ->
#        challenge
#      {:error, error} ->
#        IO.puts(error)
#    end
    signature = Base.decode64(signed_challenge)
    [key_entry] = :public_key.pem_decode(public_PEM)
    dbg()
    public_key = :public_key.pem_entry_decode(key_entry)
    :public_key.verify(
      challenge_string,
      :sha256,
      signature,
      public_key
    )
  end
end
