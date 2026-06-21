defmodule Bubbli.Social.GroupMember do
  use Ash.Resource,
    otp_app: :bubbli,
    domain: Bubbli.Social,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource]

  json_api do
    type "group_member"

    routes do
      base "/group-members"

      post :join
      delete :leave
      delete :remove_member, route: "/:id/remove"
    end
  end

  postgres do
    table "group_members"
    repo Bubbli.Repo
  end

  actions do
    defaults [:read]

    create :create do
      description "Internal: create a group member (used by system actions)"
      accept [:group_id, :user_id, :role]
    end

    create :join do
      description "Join a public group"
      accept []

      argument :group_id, :uuid do
        allow_nil? false
      end

      change relate_actor(:user)
      change set_attribute(:role, :member)

      change fn changeset, _context ->
        group_id = Ash.Changeset.get_argument(changeset, :group_id)
        Ash.Changeset.force_change_attribute(changeset, :group_id, group_id)
      end
    end

    destroy :leave do
      description "Leave a group"
    end

    destroy :remove_member do
      description "Remove a member from a group (admin only)"
    end
  end

  policies do
    policy action(:create) do
      description "Internal create - only allowed without authorization"
      forbid_if always()
    end

    policy action(:join) do
      description "Authenticated users can join public groups"
      authorize_if actor_present()
    end

    policy action_type(:read) do
      description "Users can read group members"
      authorize_if always()
    end

    policy action(:leave) do
      description "Users can leave groups they belong to"
      authorize_if expr(user_id == ^actor(:id))
    end

    policy action(:remove_member) do
      description "Only the group owner or admins can remove members"
      authorize_if expr(group.owner_id == ^actor(:id))
      authorize_if expr(exists(group.members, user_id == ^actor(:id) and role == :admin))
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :group_id, :uuid do
      allow_nil? false
    end

    attribute :user_id, :uuid do
      allow_nil? false
    end

    attribute :role, :atom do
      allow_nil? false
      default :member
      public? true
      constraints one_of: [:admin, :member]
    end

    create_timestamp :inserted_at
  end

  relationships do
    belongs_to :group, Bubbli.Social.Group do
      allow_nil? false
      attribute_writable? true
      define_attribute? false
      source_attribute :group_id
      public? true
    end

    belongs_to :user, Bubbli.Accounts.User do
      allow_nil? false
      attribute_writable? true
      define_attribute? false
      source_attribute :user_id
      public? true
    end
  end

  identities do
    identity :unique_group_member, [:group_id, :user_id],
      message: "user is already a member of this group"
  end
end
