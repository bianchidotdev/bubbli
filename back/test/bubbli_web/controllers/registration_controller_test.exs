defmodule BubbliWeb.RegistrationControllerTest do
  import Plug.Conn
  import Phoenix.ConnTest
  @endpoint MyAppWeb.Endpoint

  describe "start" do
    test "verifies user does not exist", %{conn: conn} do
      conn = post(conn, ~p"/api/v1/registration_start", email: "testing@example.com")
      assert json_response(conn, 409)["success"] == false
      assert json_response(conn, 409)["errors"] == []
    end

    test "returns an ok if user does not already exist" do
      conn = post(conn, ~p"/api/v1/registration_start", email: "testing@example.com")
      assert json_response(conn, 200)["success"]
    end
  end
end
