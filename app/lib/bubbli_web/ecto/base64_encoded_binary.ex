defmodule BubbliWeb.Base64EncodedBinary do
  @moduledoc false
  use Ecto.Type

  @impl true
  def type, do: :binary

  @impl true
  def cast(binary) when is_binary(binary) do
    case Base.decode64(binary) do
      {:ok, decoded_binary} -> {:ok, decoded_binary}
      _ -> :error
    end
  end

  @impl true
  def load(binary) when is_binary(binary) do
    case Base.decode64(binary) do
      {:ok, decoded_binary} -> {:ok, decoded_binary}
      _ -> :error
    end
  end

  @impl true
  def dump(binary) when is_binary(binary), do: {:ok, Base.encode64(binary)}
end
