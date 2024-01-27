defmodule BubbliWeb.PostsControllerTest do
  use BubbliWeb.ConnCase, async: true

  import BubbliFixtures.AccountsFixtures

  def log_in_user(%{conn: conn}) do
    user = user_registration_fixture()
    token = Bubbli.create_user_api_token(user)
    conn = put_req_cookie(conn, "authorization", token)
    %{conn: conn, timeline: user.home_timeline}
  end

  describe "when user is logged in" do
    setup [:log_in_user]

    test "returns a 200 on valid attributes for a users own timeline", %{conn: conn, timeline: timeline} do
      post_attrs = %{
        protected_content: Base.encode64(Faker.Lorem.paragraph()),
        author_id: timeline.user_id,
        timeline_id: timeline.id,
        encryption_algorithm: %{}
      }

      conn = post(conn, ~p"/api/v1/timelines/#{timeline.id}/posts", post_attrs)
      assert json_response(conn, 200)["success"]
    end

    test "returns a 400 if missing attributes", %{conn: conn} do
      conn = post(conn, ~p"/api/v1/timelines/home/posts", %{})
      assert json_response(conn, 400)["errors"] == %{"message" => "Bad Request"}
    end

    # TODO: test authorization
    # test "returns a 403 if posting on a timeline of an unconnected entity", %{conn: conn} do
    #   conn = post(conn, ~p"/api/v1/timelines/abc123/posts", %{})
    #   assert json_response(conn, 403)["errors"] == ["forbidden"]
    # end
  end
end
