defmodule BubbliWeb.AuthenticationJson do
  def init(%{challenge: challenge}) do
    %{challenge: challenge.challenge_string}
  end

  def successfully_authenticated(%{user_id: user_id}) do
    %{
      success: true,
      user_id: user_id
    }
  end
end
