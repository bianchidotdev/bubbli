defmodule Bubbli.Account do
  @moduledoc """
  The Account context.
  """

  import Ecto.Query, warn: false
  alias Bubbli.Repo

  alias Bubbli.Account.{User, AuthenticationChallenge}

  def auth_challenge_user(email) do
    query = from u in User, where: u.email == ^email

    case Repo.one(query) do
      nil ->
        {:error, :no_user_found}

      user ->
        # TODO(bianchi): need to generate and store a one-time use string
        {:ok, auth_challenge} = create_auth_challenge(user.email)
        {:ok, %{salt: user.salt, challenge: auth_challenge.challenge_string}}
    end
  end

  def get_auth_challenge(email, challenge_string) do
    query =
      from c in AuthenticationChallenge,
        where: c.email == ^email and c.challenge_string == ^challenge_string

    case Repo.one(query) do
      nil ->
        {:error, :no_challenge_found}

      challenge ->
        # TODO(bianchi): have clause for expired token
        {:ok, challenge}
    end
  end

  def validate_auth_challenge() do
  end

  def authenticate_user(_username) do
    # TODO(bianchi): implement
  end

  def create_auth_challenge(email) do
    # cryptographic challenge reference docs: https://www.w3.org/TR/webauthn-2/#sctn-cryptographic-challenges
    challenge_string = :crypto.strong_rand_bytes(32) |> Base.url_encode64()
    # TODO(bianchi): move auth timeout window into configuration
    expiry_time = Timex.now() |> Timex.shift(minutes: 5) |> DateTime.truncate(:second)

    %AuthenticationChallenge{challenge_string: challenge_string, expires_at: expiry_time}
    |> AuthenticationChallenge.changeset(%{email: email})
    |> Repo.insert()
  end

  def user_exists?(email) do
    query = from u in User, where: u.email == ^email
    Repo.exists?(query)
  end

  @doc """
  Returns the list of users.

  ## Examples

      iex> list_users()
      [%User{}, ...]

  """
  def list_users do
    Repo.all(User)
  end

  @doc """
  Gets a single user.

  Raises `Ecto.NoResultsError` if the User does not exist.

  ## Examples

      iex> get_user!(123)
      %User{}

      iex> get_user!(456)
      ** (Ecto.NoResultsError)

  """
  def get_user!(id), do: Repo.get!(User, id)

  @doc """
  Creates a user.

  ## Examples

      iex> create_user(%{field: value})
      {:ok, %User{}}

      iex> create_user(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert(returning: [:salt])
  end

  @doc """
  Updates a user.

  ## Examples

      iex> update_user(user, %{field: new_value})
      {:ok, %User{}}

      iex> update_user(user, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_user(%User{} = user, attrs) do
    user
    |> User.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a user.

  ## Examples

      iex> delete_user(user)
      {:ok, %User{}}

      iex> delete_user(user)
      {:error, %Ecto.Changeset{}}

  """
  def delete_user(%User{} = user) do
    Repo.delete(user)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking user changes.

  ## Examples

      iex> change_user(user)
      %Ecto.Changeset{data: %User{}}

  """
  def change_user(%User{} = user, attrs \\ %{}) do
    User.changeset(user, attrs)
  end
end