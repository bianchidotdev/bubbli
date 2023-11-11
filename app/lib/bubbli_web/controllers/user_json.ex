defmodule BubbliWeb.UserJSON do
  def user(%{user: user}) do
    if user do
      %{user: BubbliSchema.User.serialize_for_api(user)}
    end
  end
end
