defmodule Bubbli.Social.CircleMember do
  use Ash.Resource,
    otp_app: :bubbli,
    domain: Bubbli.Social,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer]

  postgres do
    table "circle_members"
    repo Bubbli.Repo
  end

  actions do
    defaults [:read]

    create :add_member do
      description "Add a user to a custom circle"
      accept []

      argument :circle_id, :uuid, allow_nil?: false
      argument :user_id, :uuid, allow_nil?: false

      change fn changeset, _context ->
        changeset
        |> Ash.Changeset.force_change_attribute(
          :circle_id,
          Ash.Changeset.get_argument(changeset, :circle_id)
        )
        |> Ash.Changeset.force_change_attribute(
          :user_id,
          Ash.Changeset.get_argument(changeset, :user_id)
        )
      end
    end

    destroy :remove_member do
      description "Remove a user from a circle"
    end
  end

  policies do
    policy action(:add_member) do
      description "Only the circle owner can add members"
      authorize_if actor_present()
    end

    policy action_type(:read) do
      description "Users can read circle members"
      authorize_if always()
    end

    policy action(:remove_member) do
      description "Only the circle owner can remove members"
      authorize_if actor_present()
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :circle_id, :uuid do
      allow_nil? false
    end

    attribute :user_id, :uuid do
      allow_nil? false
    end

    create_timestamp :inserted_at
  end

  relationships do
    belongs_to :circle, Bubbli.Social.Circle do
      allow_nil? false
      attribute_writable? true
      define_attribute? false
      source_attribute :circle_id
    end

    belongs_to :user, Bubbli.Accounts.User do
      allow_nil? false
      attribute_writable? true
      define_attribute? false
      source_attribute :user_id
    end
  end

  identities do
    identity :unique_circle_member, [:circle_id, :user_id],
      message: "user is already a member of this circle"
  end
end
