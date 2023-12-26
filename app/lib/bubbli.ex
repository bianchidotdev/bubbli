defmodule Bubbli do
  @moduledoc """
  Bubbli keeps the contexts that define your domain
  and business logic.

  Contexts are also responsible for managing your data, regardless
  if it comes from the database, an external API or others.
  """
  use Boundary, deps: [BubbliSchema, Ecto.Repo, Ecto.Query], exports: [Posts]

  alias Bubbli.Accounts

  defdelegate list_users(), to: Accounts
  defdelegate user_exists?(email), to: Accounts
  defdelegate get_user(id), to: Accounts
  defdelegate get_user!(id), to: Accounts
  defdelegate get_user_by(query), to: Accounts
  defdelegate fetch_user_by_api_token(token), to: Accounts
  defdelegate create_user_api_token(user), to: Accounts
  defdelegate verify_user(user, password), to: Accounts
  defdelegate get_client_key_by_user_and_type(user, type), to: Accounts
  defdelegate register_user(attrs), to: Accounts
  defdelegate update_user(user, attrs), to: Accounts
  defdelegate change_user(user), to: Accounts
  defdelegate delete_user(user), to: Accounts
  defdelegate change_user(user, attrs), to: Accounts

  defdelegate create_client_key(attrs), to: Accounts

  # TODO: Create new context for user content
  # defdelegate get_reactions_by_reactable(reactable_type, reactible_id), to: ???
end
