defmodule BubbliWeb.RegistrationJSON do
  @doc """
  """
  def init(%{challenge: challenge}) do
    %{challenge: challenge.challenge_string}
  end

  def user_exists(_map) do
    %{error: :user_exists}
  end

  def successfully_authenticated(_map) do
    %{
      success: true
    }
  end
end
