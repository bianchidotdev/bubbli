defmodule Bubbli.Social do
  use Ash.Domain,
    otp_app: :bubbli,
    extensions: [AshJsonApi.Domain]

  json_api do
    prefix "/api"
    log_errors? true
  end

  resources do
    resource Bubbli.Social.ConnectionRequest do
      define :send_connection_request, action: :send, args: [:receiver_id]
      define :accept_connection_request, action: :accept
      define :reject_connection_request, action: :reject
      define :cancel_connection_request, action: :cancel
      define :list_incoming_connection_requests, action: :list_incoming
      define :list_outgoing_connection_requests, action: :list_outgoing
      define :get_connection_request, action: :read, get_by: [:id]
    end

    resource Bubbli.Social.Connection do
      define :list_connections, action: :list
      define :remove_connection, action: :remove
      define :get_connection, action: :read, get_by: [:id]
    end

    resource Bubbli.Social.Circle
    resource Bubbli.Social.CircleMember

    resource Bubbli.Social.Group do
      define :create_group, action: :create
      define :list_groups, action: :list
      define :get_group, action: :read, get_by: [:id]
    end

    resource Bubbli.Social.GroupMember do
      define :join_group, action: :join, args: [:group_id]
    end

    resource Bubbli.Social.Post do
      define :create_post, action: :create
      define :list_feed, action: :list_feed
    end

    resource Bubbli.Social.PostAudience
  end
end
