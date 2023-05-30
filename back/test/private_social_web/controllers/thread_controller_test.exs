defmodule PrivateSocialWeb.ThreadControllerTest do
  use PrivateSocialWeb.ConnCase

  import PrivateSocial.ConversationFixtures

  alias PrivateSocial.Conversation.Thread

  @create_attrs %{

  }
  @update_attrs %{

  }
  @invalid_attrs %{}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all threads", %{conn: conn} do
      conn = get(conn, ~p"/api/threads")
      assert json_response(conn, 200)["data"] == []
    end
  end

  describe "create thread" do
    test "renders thread when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/threads", thread: @create_attrs)
      assert %{"id" => id} = json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/threads/#{id}")

      assert %{
               "id" => ^id
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/threads", thread: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "update thread" do
    setup [:create_thread]

    test "renders thread when data is valid", %{conn: conn, thread: %Thread{id: id} = thread} do
      conn = put(conn, ~p"/api/threads/#{thread}", thread: @update_attrs)
      assert %{"id" => ^id} = json_response(conn, 200)["data"]

      conn = get(conn, ~p"/api/threads/#{id}")

      assert %{
               "id" => ^id
             } = json_response(conn, 200)["data"]
    end

    test "renders errors when data is invalid", %{conn: conn, thread: thread} do
      conn = put(conn, ~p"/api/threads/#{thread}", thread: @invalid_attrs)
      assert json_response(conn, 422)["errors"] != %{}
    end
  end

  describe "delete thread" do
    setup [:create_thread]

    test "deletes chosen thread", %{conn: conn, thread: thread} do
      conn = delete(conn, ~p"/api/threads/#{thread}")
      assert response(conn, 204)

      assert_error_sent 404, fn ->
        get(conn, ~p"/api/threads/#{thread}")
      end
    end
  end

  defp create_thread(_) do
    thread = thread_fixture()
    %{thread: thread}
  end
end
