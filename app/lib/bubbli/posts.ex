defmodule Bubbli.Posts do
  @moduledoc """
  The Post context.
  """

  import Ecto.Query, warn: false

  alias Bubbli.Repo
  alias BubbliSchema.Post

  @doc """
  Returns the list of posts.

  ## Examples

      iex> list_posts()
      [%post{}, ...]

  """
  def list_posts do
    Repo.all(Post)
  end

  def get_posts_for_timeline(timeline_id) do
    query =
      from(p in Post,
        where: p.timeline_id == ^timeline_id
      )

    Repo.all(query)
  end

  def get_posts_for_user(user) do
    # TODO: replace with flop
    query =
      from(p in Post,
        where:
          p.timeline_id in subquery(
            from(t in BubbliSchema.Timeline,
              where: t.user_id == ^user.id,
              select: t.id
            )
          )
      )

    Repo.all(query)
  end

  def get_post(id), do: Repo.get(Post, id)

  @doc """
  Gets a single post.

  Raises `Ecto.NoResultsError` if the post does not exist.

  ## Examples

      iex> get_post!(123)
      %post{}

      iex> get_post!(456)
      ** (Ecto.NoResultsError)

  """
  def get_post!(id), do: Repo.get!(Post, id)

  @doc """
  Creates a post.

  ## Examples

      iex> create_post(%{field: value})
      {:ok, %post{}}

      iex> create_post(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_post(attrs \\ %{}) do
    %Post{}
    |> Post.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, post} ->
        post = Repo.preload(post, [timeline: :encryption_context])
        {:ok, post}

      {:error, _} = err ->
        err
    end
  end

  @doc """
  Updates a post.

  ## Examples

      iex> update_post(post, %{field: new_value})
      {:ok, %post{}}

      iex> update_post(post, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_post(%Post{} = post, attrs) do
    post
    |> Post.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a post.

  ## Examples

      iex> delete_post(post)
      {:ok, %post{}}

      iex> delete_post(post)
      {:error, %Ecto.Changeset{}}

  """
  def delete_post(%Post{} = post) do
    Repo.delete(post)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking post changes.

  ## Examples

      iex> change_post(post)
      %Ecto.Changeset{data: %post{}}

  """
  def change_post(%Post{} = post, attrs \\ %{}) do
    Post.changeset(post, attrs)
  end
end
