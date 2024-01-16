defmodule BubbliWeb.UserJSON do
  def user(%{user: nil}) do
    %{}
  end

  def user(%{user: user}) do
    if user do
      BubbliWeb.UserView.render("user.json", %{user: user})
    end
  end
end
