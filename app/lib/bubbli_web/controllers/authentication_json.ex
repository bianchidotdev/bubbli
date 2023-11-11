defmodule BubbliWeb.AuthenticationJSON do
  def start(%{challenge: challenge}) do
    %{challenge: challenge.challenge_string}
  end

  def logout(_) do
    %{
      success: true
    }
  end

  def user_found(%{user: user}) do
    %{
      success: true,
      user: BubbliSchema.User.serialize_for_api(user)
    }
  end

  def failed_login(%{error: error}) do
    %{
      success: false,
      errors: [error]
    }
  end

  def successfully_authenticated(%{user: user, client_key: client_key}) do
    %{
      success: true,
      user: BubbliSchema.User.serialize_for_api(user),
      encrypted_master_private_key: client_key.encrypted_private_key,
      encrypted_master_private_key_iv: client_key.encryption_iv
    }
  end
end
