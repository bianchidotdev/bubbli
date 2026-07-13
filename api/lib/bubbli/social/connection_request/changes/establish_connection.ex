defmodule Bubbli.Social.ConnectionRequest.Changes.EstablishConnection do
  @moduledoc """
  After a request is accepted, creates the mutual connection as two directional
  adjacency edges (requester -> receiver and receiver -> requester).

  Runs in the same transaction as the accept update, so the request status and
  both edges are committed atomically.
  """

  use Ash.Resource.Change

  @impl true
  def change(changeset, _opts, _context) do
    Ash.Changeset.after_action(changeset, fn _changeset, request ->
      with {:ok, _} <- create_edge(request.requester_id, request.receiver_id),
           {:ok, _} <- create_edge(request.receiver_id, request.requester_id) do
        {:ok, request}
      end
    end)
  end

  defp create_edge(user_id, peer_id) do
    Bubbli.Social.Connection
    |> Ash.Changeset.for_create(:establish, %{user_id: user_id, peer_id: peer_id},
      authorize?: false
    )
    |> Ash.create()
  end
end
