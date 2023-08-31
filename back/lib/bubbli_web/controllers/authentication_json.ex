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
      user: Bubbli.Account.User.serialize_for_api(user)
    }
  end

  def failed_login(%{error: error}) do
    %{
      success: false,
      errors: [error]
    }
  end

  def successfully_authenticated(%{user: user}) do
    %{
      success: true,
      user: Bubbli.Account.User.serialize_for_api(user)
    }
  end
end
