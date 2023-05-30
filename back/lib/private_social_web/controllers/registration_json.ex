defmodule PrivateSocialWeb.RegistrationJSON do
  @doc """
  """
  def init(%{challenge: challenge, temp_user: temp_user}) do
    %{challenge: challenge.challenge_string, salt: temp_user.salt}
  end

  def user_exists(_map) do
    %{error: :user_exists}
  end
end
