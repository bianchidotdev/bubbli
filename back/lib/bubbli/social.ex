defmodule Bubbli.Social do
  use Ash.Domain,
    otp_app: :bubbli,
    extensions: [AshJsonApi.Domain]

  json_api do
    prefix "/api"
    log_errors? true
  end

  resources do
    resource Bubbli.Social.Connection do
      define :send_connection_request, action: :send_request, args: [:receiver_id]
      define :accept_connection, action: :accept
      define :reject_connection, action: :reject
      define :remove_connection, action: :remove
      define :list_connections, action: :list_accepted
      define :list_pending_incoming_connections, action: :list_pending_incoming
      define :list_pending_outgoing_connections, action: :list_pending_outgoing
      define :get_connection, action: :read, get_by: [:id]
    end

    resource Bubbli.Social.Circle
    resource Bubbli.Social.CircleMember
  end
end
