defmodule BubbliWeb.ErrorJSONTest do
  use BubbliWeb.ConnCase, async: true

  test "renders 404" do
    assert BubbliWeb.ErrorJSON.render("404.json", %{}) == %{errors: %{message: "Not Found"}}
  end

  test "renders 500" do
    assert BubbliWeb.ErrorJSON.render("500.json", %{}) ==
             %{errors: %{message: "Internal Server Error"}}
  end
end
