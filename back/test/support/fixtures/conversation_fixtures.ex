defmodule PrivateSocial.ConversationFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `PrivateSocial.Conversation` context.
  """

  @doc """
  Generate a thread.
  """
  def thread_fixture(attrs \\ %{}) do
    {:ok, thread} =
      attrs
      |> Enum.into(%{

      })
      |> PrivateSocial.Conversation.create_thread()

    thread
  end
end
