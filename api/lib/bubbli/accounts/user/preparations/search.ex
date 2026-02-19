defmodule Bubbli.Accounts.User.Preparations.Search do
  @moduledoc """
  Applies ILIKE filtering on profile `handle` and `display_name` for user search,
  and excludes the current actor from results.

  Expects the query to have a `:query` argument containing the search term.
  ILIKE special characters (`%`, `_`, `\\`) are escaped before matching.
  """

  use Ash.Resource.Preparation

  require Ash.Query

  @impl true
  def prepare(query, _opts, context) do
    search_term = Ash.Query.get_argument(query, :query)

    # Escape ILIKE special characters, then wrap in wildcards
    pattern =
      search_term
      |> String.replace("\\", "\\\\")
      |> String.replace("%", "\\%")
      |> String.replace("_", "\\_")
      |> then(&"%#{&1}%")

    query
    |> Ash.Query.filter(
      exists(
        profile,
        not is_nil(handle) and
          (fragment("? ILIKE ?", handle, ^pattern) or
             fragment("? ILIKE ?", display_name, ^pattern))
      )
    )
    |> exclude_actor(context)
  end

  defp exclude_actor(query, %{actor: %{id: actor_id}}) when not is_nil(actor_id) do
    Ash.Query.filter(query, id != ^actor_id)
  end

  defp exclude_actor(query, _context), do: query
end
