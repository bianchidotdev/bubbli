defmodule BubbliWeb.RegistrationJSON do
  @doc """
  """
  def authenticated(%{current_user: user}) do
    %{authenticated: true, user_id: user.id}
  end

  def init(%{challenge: challenge}) do
    %{
      success: true,
      challenge: challenge.challenge_string
    }
  end

  def user_exists(_map) do
    %{error: :user_exists}
  end

  def successfully_registered(%{user_id: user_id}) do
    %{
      success: true,
      user_id: user_id
    }
  end
end
