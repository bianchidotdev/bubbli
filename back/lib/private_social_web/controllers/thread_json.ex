defmodule PrivateSocialWeb.ThreadJSON do
  alias PrivateSocial.Conversation.Thread

  @doc """
  Renders a list of threads.
  """
  def index(%{threads: threads}) do
    %{data: for(thread <- threads, do: data(thread))}
  end

  @doc """
  Renders a single thread.
  """
  def show(%{thread: thread}) do
    %{data: data(thread)}
  end

  defp data(%Thread{} = thread) do
    %{
      id: thread.id
    }
  end
end
