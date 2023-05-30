defmodule PrivateSocialWeb.ThreadController do
  use PrivateSocialWeb, :controller

  alias PrivateSocial.Conversation
  alias PrivateSocial.Conversation.Thread

  action_fallback PrivateSocialWeb.FallbackController

  def index(conn, _params) do
    threads = Conversation.list_threads()
    render(conn, :index, threads: threads)
  end

  def create(conn, %{"thread" => thread_params}) do
    with {:ok, %Thread{} = thread} <- Conversation.create_thread(thread_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/threads/#{thread}")
      |> render(:show, thread: thread)
    end
  end

  def show(conn, %{"id" => id}) do
    thread = Conversation.get_thread!(id)
    render(conn, :show, thread: thread)
  end

  def update(conn, %{"id" => id, "thread" => thread_params}) do
    thread = Conversation.get_thread!(id)

    with {:ok, %Thread{} = thread} <- Conversation.update_thread(thread, thread_params) do
      render(conn, :show, thread: thread)
    end
  end

  def delete(conn, %{"id" => id}) do
    thread = Conversation.get_thread!(id)

    with {:ok, %Thread{}} <- Conversation.delete_thread(thread) do
      send_resp(conn, :no_content, "")
    end
  end
end
