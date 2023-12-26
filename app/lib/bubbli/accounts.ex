defmodule Bubbli.Accounts do
  @moduledoc """
  The Account context.
  """

  import Ecto.Query, warn: false

  alias Bubbli.EncryptionContexts
  alias Bubbli.Repo
  alias Bubbli.Timelines
  alias BubbliSchema.UserToken

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
  def register_user(%{client_keys: client_keys_attrs, timeline_key_map: timeline_key_map} = attrs) do
    Repo.transact(fn ->
      with {:ok, user} <- create_user(Map.put(attrs, :is_active, true)),
           {:ok, _client_keys} <- create_client_keys(client_keys_attrs, user.id),
           {:ok, timeline} <-
             Timelines.create_timeline(%{type: :user, user_id: user.id}),
           {:ok, _encryption_context} <-
             EncryptionContexts.register_encryption_context(%{
               protected_encryption_key_map: timeline_key_map,
               user_id: user.id,
               timeline_id: timeline.id
             }) do
        {:ok, user}
      end
    end)
  end

  # API Tokens
  @doc """
  Creates a new api token for a user.

  The token returned must be saved somewhere safe.
  This token cannot be recovered from the database.
  """
  def create_user_api_token(user) do
    {encoded_token, user_token} = UserToken.build_email_token(user, "api-token")
    Repo.insert!(user_token)
    encoded_token
  end

  @doc """
  Fetches the user by API token.
  """
  def fetch_user_by_api_token(token) do
    with {:ok, query} <- UserToken.verify_email_token_query(token, "api-token"),
         %User{} = user <- Repo.one(query) do
      {:ok, user}
    else
      _ -> :error
    end
  end

  # Client Keys

  def create_client_keys(attrs_list \\ [], user_id) do
    client_key_tuples =
      Enum.map(attrs_list, fn attrs ->
        create_client_key(Map.put(attrs, :user_id, user_id))
      end)

    if Enum.all?(client_key_tuples, fn
         {:ok, _} -> true
         _ -> false
       end) do
      {:ok, Enum.map(client_key_tuples, fn {:ok, client_key} -> client_key end)}
    else
      {:error, :invalid_client_keys}
    end
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
