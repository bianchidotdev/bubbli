defmodule Bubbli.Timelines do
  @moduledoc false
  import Ecto.Query, warn: false

  alias Bubbli.Repo
  alias BubbliSchema.Timeline

  @doc """
  Returns the list of timelines.

  ## Examples

      iex> list_timelines()
      [%Timeline{}, ...]

  """
  @spec list_timelines() :: [Timeline.t()]
  def list_timelines do
    Repo.all(Timeline)
  end

  @doc """
  Gets a single timeline.

  ## Examples

      iex> get_timeline(123)
      %Timeline{}

      iex> get_timeline(456)
      nil

  """
  @spec get_timeline(binary()) :: Timeline.t() | nil
  def get_timeline(id), do: Repo.get(Timeline, id)
  @spec get_timeline!(binary()) :: Timeline.t()
  def get_timeline!(id), do: Repo.get!(Timeline, id)

  @doc """
  Creates a timeline.

  ## Examples

      iex> create_timeline(%{user_id: value, type: :user, encrypted_encryption_key: encd_enc_key})
      {:ok, %Timeline{}}

      iex> create_timeline(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @spec create_timeline(map()) :: {:ok, Timeline.t()} | {:error, Ecto.Changeset.t()}
  def create_timeline(attrs \\ %{}) do
    %Timeline{}
    |> Timeline.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a timeline.

  ## Examples

      iex> update_timeline(timeline, %{visibility: :normal})
      {:ok, %Timeline{}}

      iex> update_timeline(timeline, %{visibility: :bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @spec update_timeline(Timeline.t(), map()) :: {:ok, Timeline.t()} | {:error, Ecto.Changeset.t()}
  def update_timeline(timeline, attrs) do
    timeline
    |> Timeline.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a timeline.

  ## Examples

      iex> delete_timeline(timeline)
      {:ok, %Timeline{}}

      iex> delete_timeline(timeline)
      {:error, %Ecto.Changeset{}}

  """
  @spec delete_timeline(Timeline.t()) :: {:ok, Timeline.t()} | {:error, Ecto.Changeset.t()}
  def delete_timeline(timeline) do
    Repo.delete(timeline)
  end
end
