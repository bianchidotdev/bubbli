defmodule Bubbli.Accounts do
  @moduledoc """
  The Account context.
  """

  import Ecto.Query, warn: false

  alias Bubbli.Repo

  # alias Bubbli.Accounts.AuthenticationChallenge
  alias BubbliSchema.ClientKey
  alias BubbliSchema.User

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

  @spec get_client_key_by_user_and_type(User.t(), String.t()) :: {:ok, ClientKey.t()} | {:error, :no_key_found}
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

  # def create_auth_challenge(email) do
  #   # cryptographic challenge reference docs: https://www.w3.org/TR/webauthn-2/#sctn-cryptographic-challenges
  #   challenge_string = 32 |> :crypto.strong_rand_bytes() |> Base.url_encode64()
  #   # TODO(bianchi): move auth timeout window into configuration
  #   expiry_time = DateTime.utc_now() |> Timex.shift(minutes: 5) |> DateTime.truncate(:second)

  #   %AuthenticationChallenge{challenge_string: challenge_string, expires_at: expiry_time}
  #   |> AuthenticationChallenge.changeset(%{email: email})
  #   |> Repo.insert()
  # end

  @spec user_exists?(String.t()) :: boolean()
  def user_exists?(email) do
    query = from(u in User, where: u.email == ^email)
    Repo.exists?(query)
  end

  @spec get_user_by(Keyword.t() | map()) :: {:ok, User.t()} | {:error, atom()}
  def get_user_by(query) do
    case Repo.get_by(User, query) do
      nil ->
        {:error, :user_not_found}

      %User{} = user ->
        {:ok, user}

      error ->
        {:error, error}
    end
  end

  @spec verify_user(User.t(), String.t()) :: :ok | {:error, :invalid_password}
  def verify_user(user, password) do
    if User.verify_user(user, password) do
      :ok
    else
      {:error, :invalid_password}
    end
  end

  @spec register_user(map()) :: {:ok, User.t()} | {:error, Ecto.Changeset.t()}
  def register_user(%{client_keys: client_keys_attrs, encd_user_enc_key: _user_enc_key} = attrs) do
    Repo.transact(fn ->
      with {:ok, user} <- create_user(Map.put(attrs, :is_active, true)),
           _client_keys <-
             Enum.map(client_keys_attrs, fn key_attrs ->
               key_attrs = Map.put(key_attrs, :user_id, user.id)
               create_client_key(key_attrs)
             end) do
        # TODO: create timeline (and encryption context)
        {:ok, user}
      end
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
