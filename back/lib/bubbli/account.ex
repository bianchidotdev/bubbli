defmodule Bubbli.Account do
  @moduledoc """
  The Account context.
  """

  import Ecto.Query, warn: false

  alias Bubbli.Account.AuthenticationChallenge
  alias Bubbli.Account.User
  alias Bubbli.Account.ClientKey
  alias Bubbli.Repo

  def auth_challenge_user(email) do
    query = from(u in User, where: u.email == ^email)

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
      from(c in AuthenticationChallenge,
        where: c.email == ^email and c.challenge_string == ^challenge_string
      )

    case Repo.one(query) do
      nil ->
        {:error, :no_challenge_found}

      challenge ->
        # TODO(bianchi): have clause for expired token
        {:ok, challenge}
    end
  end

  def get_client_key_by_user_and_type(user, type) do
    query =
      from(k in ClientKey,
        where: k.user_id == ^user.id and k.type == ^type
      )

    case Repo.one(query) do
      nil ->
        {:error, :no_key_found}

      client_key ->
        {:ok, client_key}
    end
  end

  def create_auth_challenge(email) do
    # cryptographic challenge reference docs: https://www.w3.org/TR/webauthn-2/#sctn-cryptographic-challenges
    challenge_string = 32 |> :crypto.strong_rand_bytes() |> Base.url_encode64()
    # TODO(bianchi): move auth timeout window into configuration
    expiry_time = DateTime.utc_now() |> Timex.shift(minutes: 5) |> DateTime.truncate(:second)

    %AuthenticationChallenge{challenge_string: challenge_string, expires_at: expiry_time}
    |> AuthenticationChallenge.changeset(%{email: email})
    |> Repo.insert()
  end

  def user_exists?(email) do
    query = from(u in User, where: u.email == ^email)
    Repo.exists?(query)
  end

  def get_user_by(query) do
    with %User{} = user <- Repo.get_by(User, query) do
      {:ok, user}
    else
      nil -> {:error, :user_not_found}
      error -> {:error, error}
    end
  end

  def verify_user(user, password) do
    case User.verify_user(user, password) do
      true -> :ok
      false -> {:error, :invalid_password}
    end
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

  def get_user(id), do: Repo.get(User, id)

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

  def register_user(%{client_keys: client_keys_attrs, encd_user_enc_key: _user_enc_key} = attrs) do
    Repo.transaction(fn ->
      {:ok, user} = create_user(attrs)

      _client_keys =
        Enum.map(client_keys_attrs, fn key_attrs ->
          key_attrs = Map.put(key_attrs, "user_id", user.id)
          create_client_key(key_attrs)
        end)

      # TODO: create timeline (and encryption context)
      user
    end)
  end

  def create_client_key(attrs \\ %{}) do
    %ClientKey{}
    |> ClientKey.changeset(attrs)
    |> Repo.insert()
  end

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
    |> Repo.insert()
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
