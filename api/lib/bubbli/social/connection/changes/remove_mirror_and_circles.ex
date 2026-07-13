defmodule Bubbli.Social.Connection.Changes.RemoveMirrorAndCircles do
  @moduledoc """
  When a connection edge is removed, this keeps the rest of the model consistent:

    * deletes the mirror edge (so both directions disappear together), and
    * removes any circle memberships between the two users in either direction,
      since circle members must be connections.

  Runs in the same transaction as the `remove` destroy. The mirror edge is
  deleted via the non-cascading `:delete_edge` action to avoid recursion.
  """

  use Ash.Resource.Change

  require Ash.Query

  @impl true
  def change(changeset, _opts, _context) do
    Ash.Changeset.after_action(changeset, fn _changeset, edge ->
      user_id = edge.user_id
      peer_id = edge.peer_id

      delete_mirror_edge(user_id, peer_id)
      remove_shared_circle_memberships(user_id, peer_id)

      {:ok, edge}
    end)
  end

  defp delete_mirror_edge(user_id, peer_id) do
    Bubbli.Social.Connection
    |> Ash.Query.filter(user_id == ^peer_id and peer_id == ^user_id)
    |> Ash.read!(authorize?: false)
    |> Enum.each(&Ash.destroy!(&1, action: :delete_edge, authorize?: false))
  end

  defp remove_shared_circle_memberships(user_id, peer_id) do
    Bubbli.Social.CircleMember
    |> Ash.Query.filter(
      (user_id == ^peer_id and circle.owner_id == ^user_id) or
        (user_id == ^user_id and circle.owner_id == ^peer_id)
    )
    |> Ash.read!(authorize?: false)
    |> Enum.each(&Ash.destroy!(&1, action: :remove_member, authorize?: false))
  end
end
