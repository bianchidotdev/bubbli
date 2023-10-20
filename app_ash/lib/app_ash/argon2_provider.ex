defmodule AppAsh.Argon2Provider do
  @moduledoc """
  Provides the default implementation of `AshAuthentication.HashProvider` using `Argon2``.
  """
  @behaviour AshAuthentication.HashProvider

  @doc """
  Given some user input as a string, convert it into it's hashed form using `Argon2`.

  ## Example

      iex> {:ok, hashed} = hash("Marty McFly")
      ...> String.starts_with?(hashed, "$2b$04$")
      true
  """
  @impl true
  @spec hash(String.t()) :: {:ok, String.t()} | :error
  def hash(input) when is_binary(input), do: {:ok, Argon2.hash_pwd_salt(input)}
  def hash(_), do: :error

  @doc """
  Check if the user input matches the hash.

  ## Example

      iex> valid?("Marty McFly", "$2b$04$qgacrnrAJz8aPwaVQiGJn.PvryldV.NfOSYYvF/CZAGgMvvzhIE7S")
      true

  """
  @impl true
  @spec valid?(input :: String.t(), hash :: String.t()) :: boolean
  def valid?(input, hash) when is_binary(input) and is_binary(hash),
    do: Argon2.verify_pass(input, hash)

  @doc """
  Simulate a password check to help avoid timing attacks.

  ## Example

      iex> simulate()
      false
  """
  @impl true
  @spec simulate :: false
  def simulate, do: Argon2.no_user_verify()
end
