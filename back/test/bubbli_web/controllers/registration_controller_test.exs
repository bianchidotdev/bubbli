defmodule BubbliWeb.RegistrationControllerTest do
  use BubbliWeb.ConnCase

  import Bubbli.AccountFixtures

  # alias Bubbli.Account

  @start_attrs %{
    email: "testingstart@example.com"
  }
  @confirm_attrs %{
    email: "testingconfirm@example.com",
    display_name: "test mctesterson",
    salt: Base.encode64(Argon2.Base.gen_salt()),
    public_key: sample_public_key(),
    client_keys: [
      %{
        "type" => "password",
        "encryption_iv" => Base.encode64("encryptioniv"),
        "encrypted_private_key" => Base.encode64("private_key")
      }
    ],
    encrypted_user_encryption_key: Base.encode64("foobar"),
    master_password_hash: Base.encode64("foobar")
  }

  @invalid_attrs %{}

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "start" do
    test "verifies user does not exist", %{conn: conn} do
      _existing_user = user_fixture(@start_attrs)
      conn = post(conn, ~p"/api/v1/registration/start", @start_attrs)
      assert json_response(conn, 409)["success"] == false
      assert json_response(conn, 409)["errors"] == ["email_already_registered"]
    end

    test "returns an ok if user does not already exist", %{conn: conn} do
      conn = post(conn, ~p"/api/v1/registration/start", @start_attrs)
      assert json_response(conn, 200)["success"]
    end
  end

  describe "confirm" do
    test "verifies user does not exist", %{conn: conn} do
      _existing_user = user_registration_fixture(@confirm_attrs)
      conn = post(conn, ~p"/api/v1/registration/confirm", @confirm_attrs)
      assert json_response(conn, 409)["success"] == false
      assert json_response(conn, 409)["errors"] == ["email_already_registered"]
    end

    test "returns an ok if user does not already exist", %{conn: conn} do
      conn = post(conn, ~p"/api/v1/registration/confirm", @confirm_attrs)
      assert json_response(conn, 200)["success"]
    end

    test "with a malformatted public key", %{conn: conn} do
      attrs = Map.put(@confirm_attrs, :public_key, "test")
      conn = post(conn, ~p"/api/v1/registration/confirm", attrs)
      assert json_response(conn, 400)["errors"] == %{"message" => "invalid public key"}
    end
  end
end
