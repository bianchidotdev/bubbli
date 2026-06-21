defmodule Bubbli.Social.Group.Changes.AddOwnerAsAdmin do
  @moduledoc "Automatically adds the group creator as an admin member."
  use Ash.Resource.Change

  @impl true
  def change(changeset, _opts, _context) do
    Ash.Changeset.after_action(changeset, fn _changeset, group ->
      Bubbli.Social.GroupMember
      |> Ash.Changeset.for_create(:create, %{
        group_id: group.id,
        user_id: group.owner_id,
        role: :admin
      })
      |> Ash.create!(authorize?: false)

      {:ok, group}
    end)
  end
end
