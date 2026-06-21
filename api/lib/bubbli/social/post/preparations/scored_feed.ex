defmodule Bubbli.Social.Post.Preparations.ScoredFeed do
  @moduledoc """
  Sorts feed posts by source priority then recency.

  Priority tiers (lower = higher priority):
    0 - Own posts
    1 - Connection/circle posts
    2 - Group posts
    3 - Public/other posts

  Within each tier, newer posts come first.
  """

  use Ash.Resource.Preparation

  require Ash.Sort

  @impl true
  def prepare(query, _opts, _context) do
    Ash.Query.sort(query, [
      {Ash.Sort.expr_sort(
         cond do
           author_id == ^actor(:id) -> 0
           exists(post_audiences, type in [:connections, :circle]) -> 1
           exists(post_audiences, type == :group) -> 2
           true -> 3
         end,
         :integer
       ), :asc},
      inserted_at: :desc
    ])
  end
end
