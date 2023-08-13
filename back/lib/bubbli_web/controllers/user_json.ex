defmodule BubbliWeb.UserJSON do
  def user(%{user: user}) do
    if user do
      %{user: Bubbli.Account.User.serialize_for_api(user)}
    end
  end
end
