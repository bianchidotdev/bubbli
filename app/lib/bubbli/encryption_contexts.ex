defmodule Bubbli.EncryptionContexts do
  @moduledoc """
  The EncryptionContexts context.
  """

  import Ecto.Query, warn: false

  alias Bubbli.Repo
  alias BubbliSchema.EncryptionContext
  alias BubbliSchema.EncryptionKey

  @doc """
  Returns the list of encryption_contexts.

  ## Examples

      iex> list_encryption_contexts()
      [%encryption_context{}, ...]

  """
  def list_encryption_contexts do
    Repo.all(EncryptionContext)
  end

  def get_encryption_context(id), do: Repo.get(EncryptionContext, id)

  @doc """
  Gets a single encryption_context.

  Raises `Ecto.NoResultsError` if the encryption_context does not exist.

  ## Examples

      iex> get_encryption_context!(123)
      %encryption_context{}

      iex> get_encryption_context!(456)
      ** (Ecto.NoResultsError)

  """
  def get_encryption_context!(id), do: Repo.get!(EncryptionContext, id)

  @doc """
  Creates a encryption_context and associated encryption_key.

  ## Examples

      iex> register_encryption_context(%{protected_encryption_key: value})
      {:ok, %encryption_context{}}

      iex> register_encryption_context(%{protected_encryption_key: nil})
      {:error, %Ecto.Changeset{}}

  """
  def register_encryption_context(%{
        protected_encryption_key_map: protected_encryption_key_map,
        user_id: user_id,
        timeline_id: timeline_id
      }) do
    Repo.transact(fn ->
      with {:ok, encryption_context} <- create_encryption_context(%{timeline_id: timeline_id}),
           # TODO: cast_assoc for encryption_key
           {:ok, _encryption_key} <-
             create_encryption_key(%{
               protected_encryption_key: protected_encryption_key_map.protected_encryption_key,
               key_algorithm: protected_encryption_key_map.key_algorithm,
               wrap_algorithm: protected_encryption_key_map.wrap_algorithm,
               key_usages: protected_encryption_key_map.key_usages,
               user_id: user_id,
               encryption_context_id: encryption_context.id
             }) do
        {:ok, encryption_context}
      end
    end)
  end

  defp create_encryption_context(attrs) do
    %EncryptionContext{}
    |> EncryptionContext.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a encryption_context.

  ## Examples

      iex> update_encryption_context(%encryption_context{}, %{field: value})
      {:ok, %encryption_context{}}

      iex> update_encryption_context(%encryption_context{}, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_encryption_context(%EncryptionContext{} = encryption_context, attrs) do
    encryption_context
    |> EncryptionContext.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a encryption_context.

  ## Examples

      iex> delete_encryption_context(%encryption_context{})
      {:ok, %encryption_context{}}

  """
  def delete_encryption_context(%EncryptionContext{} = encryption_context) do
    Repo.delete(encryption_context)
  end

  def list_encryption_keys do
    Repo.all(EncryptionKey)
  end

  def get_encryption_key(id), do: Repo.get(EncryptionKey, id)
  def get_encryption_key!(id), do: Repo.get!(EncryptionKey, id)

  def get_encryption_keys_by_user(user_id) do
    Repo.all(from e in EncryptionKey, where: e.user_id == ^user_id)
  end

  def get_encryption_key_by_user_and_encryption_context(user_id, encryption_context_id) do
    Repo.get_by(EncryptionKey, user_id: user_id, encryption_context_id: encryption_context_id)
  end

  def create_encryption_key(attrs \\ %{}) do
    %EncryptionKey{}
    |> EncryptionKey.changeset(attrs)
    |> Repo.insert()
  end

  def update_encryption_key(%EncryptionKey{} = encryption_key, attrs) do
    encryption_key
    |> EncryptionKey.changeset(attrs)
    |> Repo.update()
  end

  def delete_encryption_key(%EncryptionKey{} = encryption_key) do
    Repo.delete(encryption_key)
  end
end
