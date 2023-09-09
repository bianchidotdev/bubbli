defmodule BubbliWeb.RegistrationJSON do
  @doc """
  """
  def authenticated(%{current_user: user}) do
    %{
      sucess: true,
      authenticated: true,
      user_id: user.id
    }
  end

  def init(%{challenge: challenge}) do
    %{
      success: true,
      challenge: challenge.challenge_string
    }
  end

  def user_exists(_map) do
    %{success: false, errors: [:email_already_registered]}
  end

  def invalid_public_key(_map) do
    %{success: false, errors: %{message: "invalid public key"}}
  end

  def successfully_registered(%{user_id: user_id}) do
    %{
      success: true,
      user_id: user_id
    }
  end
end
