defmodule Bubbli.Social.PostAudience do
  use Ash.Resource,
    otp_app: :bubbli,
    domain: Bubbli.Social,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource]

  json_api do
    type "post_audience"
  end

  postgres do
    table "post_audiences"
    repo Bubbli.Repo

    custom_indexes do
      index [:post_id, :type]
    end
  end

  actions do
    defaults [:read, :destroy, :update]

    create :create do
      primary? true
      accept [:type, :circle_id, :group_id]
    end
  end

  policies do
    policy action_type(:read) do
      description "Post audiences are readable by anyone who can read the post"
      authorize_if always()
    end

    policy action_type(:create) do
      description "Post audiences are created through post management"
      authorize_if always()
    end

    policy action_type(:destroy) do
      description "Post audiences are destroyed through post management"
      authorize_if always()
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :type, :atom do
      allow_nil? false
      public? true
      constraints one_of: [:public, :connections, :circle, :group, :private]
    end

    attribute :post_id, :uuid do
      allow_nil? false
    end

    attribute :circle_id, :uuid do
      public? true
    end

    attribute :group_id, :uuid do
      public? true
    end

    create_timestamp :inserted_at
  end

  relationships do
    belongs_to :post, Bubbli.Social.Post do
      allow_nil? false
      attribute_writable? true
      define_attribute? false
      source_attribute :post_id
    end

    belongs_to :circle, Bubbli.Social.Circle do
      allow_nil? true
      attribute_writable? true
      define_attribute? false
      source_attribute :circle_id
      public? true
    end

    belongs_to :group, Bubbli.Social.Group do
      allow_nil? true
      attribute_writable? true
      define_attribute? false
      source_attribute :group_id
      public? true
    end
  end
end
