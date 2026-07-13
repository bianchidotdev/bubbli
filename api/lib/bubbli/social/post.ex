defmodule Bubbli.Social.Post do
  use Ash.Resource,
    otp_app: :bubbli,
    domain: Bubbli.Social,
    data_layer: AshPostgres.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshJsonApi.Resource]

  json_api do
    type "post"
    includes author: [:profile], post_audiences: []

    routes do
      base "/posts"

      index :list_feed, route: "/feed"
      get :read
      post :create
      patch :update
      delete :destroy
    end
  end

  postgres do
    table "posts"
    repo Bubbli.Repo
  end

  actions do
    defaults [:read]

    read :list_feed do
      description "List posts visible to the current user"

      prepare Bubbli.Social.Post.Preparations.ScoredFeed
      pagination offset?: true, default_limit: 20, countable: true

      filter expr(
               author_id == ^actor(:id) or
                 exists(post_audiences, type == :public) or
                 (exists(post_audiences, type == :connections) and
                    exists(author.connections, peer_id == ^actor(:id))) or
                 exists(
                   post_audiences,
                   type == :circle and exists(circle.members, user_id == ^actor(:id))
                 ) or
                 exists(
                   post_audiences,
                   type == :group and exists(group.members, user_id == ^actor(:id))
                 )
             )
    end

    create :create do
      description "Create a new post with audience targeting"
      accept [:body]
      change relate_actor(:author)

      argument :audiences, {:array, :map} do
        allow_nil? false
        default [%{type: :connections}]
      end

      change manage_relationship(:audiences, :post_audiences, type: :direct_control)
    end

    update :update do
      description "Edit post body"
      accept [:body]
    end

    destroy :destroy do
      description "Delete a post"
    end
  end

  policies do
    policy action(:create) do
      description "Any authenticated user can create a post"
      authorize_if actor_present()
    end

    policy action(:list_feed) do
      description "Any authenticated user can view their feed"
      authorize_if actor_present()
    end

    policy action_type(:read) do
      description "Users can read posts they have access to"
      authorize_if expr(author_id == ^actor(:id))
      authorize_if expr(exists(post_audiences, type == :public))

      authorize_if expr(
                     exists(post_audiences, type == :connections) and
                       exists(author.connections, peer_id == ^actor(:id))
                   )

      authorize_if expr(
                     exists(
                       post_audiences,
                       type == :circle and exists(circle.members, user_id == ^actor(:id))
                     )
                   )

      authorize_if expr(
                     exists(
                       post_audiences,
                       type == :group and exists(group.members, user_id == ^actor(:id))
                     )
                   )
    end

    policy action(:update) do
      description "Only the author can edit a post"
      authorize_if expr(author_id == ^actor(:id))
    end

    policy action(:destroy) do
      description "Only the author can delete a post"
      authorize_if expr(author_id == ^actor(:id))
    end
  end

  attributes do
    uuid_primary_key :id

    attribute :body, :string do
      allow_nil? false
      public? true
      constraints min_length: 1, max_length: 10_000
    end

    attribute :author_id, :uuid do
      allow_nil? false
    end

    create_timestamp :inserted_at
    update_timestamp :updated_at
  end

  relationships do
    belongs_to :author, Bubbli.Accounts.User do
      allow_nil? false
      public? true
      attribute_writable? true
      define_attribute? false
      source_attribute :author_id
    end

    has_many :post_audiences, Bubbli.Social.PostAudience do
      public? true
    end
  end
end
