defmodule BubbliWeb.RegistrationControllerTest do
  use BubbliWeb.ConnCase, async: true

  import BubbliFixtures.AccountsFixtures

  @valid_attrs %{
    email: "test@example.com",
    display_name: "Test User",
    username: "testuser",
    public_key: sample_public_key(),
    client_keys: [
      %{
        protected_private_key: Base.encode64("private_key"),
        type: "password",
        key_algorithm: %{},
        wrap_algorithm: %{},
        key_usages: []
      }
    ],
    timeline_key: %{
      protected_encryption_key: Base.encode64("encrypted_timeline_key"),
      key_algorithm: %{},
      wrap_algorithm: %{},
      key_usages: []
    },
    master_password_hash: Base.encode64("password_hash")
  }
  @invalid_attrs %{}

  setup do
    conn = build_conn()
    {:ok, conn: conn}
  end

  describe "register" do
    test "verifies user does not exist", %{conn: conn} do
      _existing_user = user_fixture(@valid_attrs)
      conn = post(conn, ~p"/api/v1/auth/register", @valid_attrs)
      assert json_response(conn, 409)["success"] == false
      assert json_response(conn, 409)["errors"] == ["email_already_registered"]
    end

    test "returns an ok if user does not already exist", %{conn: conn} do
      conn = post(conn, ~p"/api/v1/auth/register", @valid_attrs)
      assert json_response(conn, 200)["success"]
    end

    test "with a malformatted public key", %{conn: conn} do
      attrs = Map.put(@valid_attrs, :public_key, "test")
      conn = post(conn, ~p"/api/v1/auth/register", attrs)
      assert json_response(conn, 400)["errors"] == %{"message" => "invalid public key"}
    end

    test "with invalid attributes", %{conn: conn} do
      conn = post(conn, ~p"/api/v1/auth/register", @invalid_attrs)
      assert json_response(conn, 400)["errors"] == %{"message" => "Bad Request"}
    end
  end
end
