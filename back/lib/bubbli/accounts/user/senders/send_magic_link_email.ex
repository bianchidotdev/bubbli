defmodule Bubbli.Accounts.User.Senders.SendMagicLinkEmail do
  @moduledoc """
  Sends a magic link email
  """

  use AshAuthentication.Sender

  import Swoosh.Email
  alias Bubbli.Mailer

  @impl true
  def send(user_or_email, token, _) do
    # if you get a user, its for a user that already exists.
    # if you get an email, then the user does not yet exist.

    email =
      case user_or_email do
        %{email: email} -> email
        email -> email
      end

    new()
    # TODO: Replace with your actual from address
    |> from({"Bubbli", "noreply@bubbli.org"})
    |> to(to_string(email))
    |> subject("Your Bubbli login link")
    |> html_body(body(token: token, email: email))
    |> Mailer.deliver!()
  end

  defp body(params) do
    # The magic link points to the React app's callback route.
    # The React app will extract the token and POST it to the API.
    callback_url = "#{frontend_url()}/auth/magic-link/callback?token=#{params[:token]}"

    """
    <p>Hello, #{params[:email]}!</p>
    <p>Click this link to sign in to Bubbli:</p>
    <p><a href="#{callback_url}">Sign in to Bubbli</a></p>
    <p>If you didn't request this link, you can safely ignore this email.</p>
    """
  end

  defp frontend_url do
    Application.get_env(:bubbli, :frontend_url, "http://localhost:5173")
  end
end
