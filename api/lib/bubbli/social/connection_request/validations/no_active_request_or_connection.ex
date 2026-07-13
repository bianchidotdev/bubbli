defmodule Bubbli.Social.ConnectionRequest.Validations.NoActiveRequestOrConnection do
  @moduledoc """
  Validates that a new connection request can be sent between two users.

  A request is rejected if:

    * the two users are already connected, or
    * a pending request already exists between them in either direction.

  Terminal requests (rejected/cancelled/accepted-then-disconnected) do NOT
  block a fresh request, so users can reconnect after a prior rejection.

  Uses the actor from context for the requester identity, since `relate_actor`
  may not have written the attribute yet when validations run.
  """

  use Ash.Resource.Validation

  require Ash.Query

  @impl true
  def init(opts), do: {:ok, opts}

  @impl true
  def validate(changeset, _opts, context) do
    receiver_id = Ash.Changeset.get_argument(changeset, :receiver_id)

    requester_id =
      case context.actor do
        %{id: id} -> id
        _ -> nil
      end

    cond do
      is_nil(receiver_id) or is_nil(requester_id) ->
        :ok

      already_connected?(requester_id, receiver_id) ->
        error("you are already connected to this user")

      pending_request_exists?(requester_id, receiver_id) ->
        error("a pending request already exists between you and this user")

      true ->
        :ok
    end
  end

  defp already_connected?(requester_id, receiver_id) do
    Bubbli.Social.Connection
    |> Ash.Query.filter(user_id == ^requester_id and peer_id == ^receiver_id)
    |> Ash.Query.limit(1)
    |> Ash.read!(authorize?: false)
    |> Enum.any?()
  end

  defp pending_request_exists?(requester_id, receiver_id) do
    Bubbli.Social.ConnectionRequest
    |> Ash.Query.filter(
      status == :pending and
        ((requester_id == ^requester_id and receiver_id == ^receiver_id) or
           (requester_id == ^receiver_id and receiver_id == ^requester_id))
    )
    |> Ash.Query.limit(1)
    |> Ash.read!(authorize?: false)
    |> Enum.any?()
  end

  defp error(message) do
    {:error, Ash.Error.Changes.InvalidArgument.exception(field: :receiver_id, message: message)}
  end
end
