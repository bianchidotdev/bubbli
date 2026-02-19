defmodule Bubbli.Social.Connection.Validations.NotSelfConnection do
  @moduledoc """
  Validates that a user cannot send a connection request to themselves.

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

    if receiver_id && requester_id && receiver_id == requester_id do
      {:error,
       Ash.Error.Changes.InvalidArgument.exception(
         field: :receiver_id,
         message: "you cannot send a connection request to yourself"
       )}
    else
      :ok
    end
  end
end
