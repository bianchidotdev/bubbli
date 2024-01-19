defmodule BubbliWeb.AuthenticationJSON do
  def start(%{challenge: challenge}) do
    %{challenge: challenge.challenge_string}
  end

  def logout(_) do
    %{
      success: true
    }
  end

  # def user_found(%{user: user}) do
  #   %{
  #     success: true,
  #     user: BubbliWeb.UserView.render("user.json", %{user: user})
  #   }
  # end

  def failed_login(%{error: error}) do
    %{
      success: false,
      errors: [error]
    }
  end

  def successfully_authenticated(%{user: user, client_key: client_key, encryption_keys: keys}) do
    # TODO: need to return the home timeline + the timeline's encryption key here
    # OR actually, maybe that just happens on dashboard load... Nah, I think the user
    # should immediately have the details necessary to post
    %{
      success: true,
      user: BubbliWeb.UserView.render("user.json", %{user: user}),
      encryption_keys: Enum.map(keys, &BubbliWeb.EncryptionKeyView.render("key.json", %{encryption_key: &1})),
      client_key: BubbliWeb.ClientKeyView.render("key.json", %{client_key: client_key})
    }
  end
end
