defmodule Bubbli.Social.Connection.Validations.NoDuplicateConnection do
  @moduledoc """
  Validates that a connection does not already exist between two users in either direction.

  The database has a unique index on `{requester_id, receiver_id}`, which prevents
  exact duplicates. But we also need to check the reverse — if User A already sent
  a request to User B, User B shouldn't be able to send a separate request to User A.

  This validation queries for any existing connection (in any status) where the two
  users appear in either the requester or receiver role.

  Uses the actor from context for the requester identity, since `relate_actor`
  may not have written the attribute yet when validations run.
  """

  use Ash.Resource.Validation

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

    if is_nil(receiver_id) || is_nil(requester_id) do
      :ok
    else
      check_existing(requester_id, receiver_id)
    end
  end

  defp check_existing(requester_id, receiver_id) do
    require Ash.Query

    existing =
      Bubbli.Social.Connection
      |> Ash.Query.filter(
        (requester_id == ^requester_id and receiver_id == ^receiver_id) or
          (requester_id == ^receiver_id and receiver_id == ^requester_id)
      )
      |> Ash.Query.limit(1)
      |> Ash.read!(authorize?: false)

    case existing do
      [] ->
        :ok

      _exists ->
        {:error,
         Ash.Error.Changes.InvalidArgument.exception(
           field: :receiver_id,
           message: "a connection already exists between these users"
         )}
    end
  end
end
