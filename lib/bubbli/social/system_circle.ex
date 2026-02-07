defmodule Bubbli.Social.SystemCircle do
  @moduledoc """
  Defines the system circles that are dynamically available to all users.

  System circles are virtual (not stored in the database) and represent
  built-in visibility tiers. To add a new system circle, simply add an
  entry to the list in `all/0` — no database migration required.
  """

  @type t :: %__MODULE__{
          id: atom(),
          name: String.t(),
          description: String.t(),
          icon: String.t()
        }

  @enforce_keys [:id, :name, :description, :icon]
  defstruct [:id, :name, :description, :icon]

  @doc "Returns all system circles."
  @spec all() :: [t()]
  def all do
    [
      %__MODULE__{
        id: :private,
        name: "Private",
        description: "Only you can see this",
        icon: "hero-lock-closed"
      },
      %__MODULE__{
        id: :all_friends,
        name: "All Friends",
        description: "All your connections can see this",
        icon: "hero-user-group"
      },
      %__MODULE__{
        id: :public,
        name: "Public",
        description: "Everyone can see this",
        icon: "hero-globe-alt"
      }
    ]
  end

  @doc "Returns the system circle IDs (atoms)."
  @spec ids() :: [atom()]
  def ids, do: Enum.map(all(), & &1.id)

  @doc "Looks up a system circle by its ID atom. Returns `nil` if not found."
  @spec get(atom()) :: t() | nil
  def get(id) when is_atom(id) do
    Enum.find(all(), &(&1.id == id))
  end

  @doc "Returns `true` if the given atom is a valid system circle ID."
  @spec valid?(atom()) :: boolean()
  def valid?(id) when is_atom(id), do: id in ids()
end
