defmodule BubbliWeb.PostsControllerTest do
  use BubbliWeb.ConnCase, async: true

  import BubbliFixtures.AccountsFixtures

  # defp log_in_user(%{conn: conn}) do
  #   %{conn: log_in_user(conn, user_fixture())}
  # end

  # describe "when user is logged in" do
  #   setup [:log_in_user]

  #   test "returns a 200 on valid attributes for a users own timeline", %{conn: conn} do
  #     conn = post(conn, ~p"/api/v1/timelines/home/posts", %{})
  #     assert json_response(conn, 200)["success"]
  #   end

  #   test "returns a 400 if missing attributes", %{conn: conn} do
  #     conn = post(conn, ~p"/api/v1/timelines/home/posts", %{})
  #     assert json_response(conn, 400)["errors"] == ["message"]
  #   end

  #   test "returns a 403 if posting on a timeline of an unconnected entity", %{conn: conn} do
  #     conn = post(conn, ~p"/api/v1/timelines/abc123/posts", %{})
  #     assert json_response(conn, 403)["errors"] == ["forbidden"]
  #   end
  # end
end
