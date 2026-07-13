defmodule Bubbli.Social.CircleMember.Validations.MustBeConnected do
  @moduledoc """
  Validates that a user being added to a circle is connected to the circle owner.

  Circles organize a user's existing connections, so you can only add people you
  are connected to. The owner is the acting user (enforced by the `add_member`
  policy), and connections are symmetric, so a single edge lookup suffices.
  """

  use Ash.Resource.Validation

  require Ash.Query

  @impl true
  def init(opts), do: {:ok, opts}

  @impl true
  def validate(changeset, _opts, context) do
    target_id = Ash.Changeset.get_argument(changeset, :user_id)

    owner_id =
      case context.actor do
        %{id: id} -> id
        _ -> nil
      end

    cond do
      is_nil(target_id) or is_nil(owner_id) ->
        :ok

      connected?(owner_id, target_id) ->
        :ok

      true ->
        {:error,
         Ash.Error.Changes.InvalidArgument.exception(
           field: :user_id,
           message: "you can only add users you are connected to"
         )}
    end
  end

  defp connected?(owner_id, target_id) do
    Bubbli.Social.Connection
    |> Ash.Query.filter(user_id == ^owner_id and peer_id == ^target_id)
    |> Ash.Query.limit(1)
    |> Ash.read!(authorize?: false)
    |> Enum.any?()
  end
end
