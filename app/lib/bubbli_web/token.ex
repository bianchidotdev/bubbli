defmodule BubbliWeb.Token do
  @moduledoc false
  require Logger

  # 1 day
  @token_age_secs 60 * 60 * 24

  def signing_salt do
    Application.get_env(:bubbli, :signing_salt)
  end

  def sign(data) do
    Phoenix.Token.sign(BubbliWeb.Endpoint, signing_salt(), data)
  end

  def verify(token) do
    case Phoenix.Token.verify(
           BubbliWeb.Endpoint,
           signing_salt(),
           token,
           max_age: @token_age_secs
         ) do
      {:ok, data} ->
        {:ok, data}

      {:error, error} ->
        Logger.warning("Got error verifying token: #{error}")
        {:error, :unauthenticated}
    end
  end
end
