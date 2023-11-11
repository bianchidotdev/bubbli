defmodule Bubbli.Repo do
  use Ecto.Repo,
    otp_app: :bubbli,
    adapter: Ecto.Adapters.Postgres

  @spec transact((-> any()), keyword()) :: {:ok, any()} | {:error, any()}
  def transact(fun, opts \\ []) do
    transaction(
      fn ->
        case fun.() do
          {:ok, value} -> value
          :ok -> :transaction_commited
          {:error, reason} -> rollback(reason)
          :error -> rollback(:transaction_rollback_error)
        end
      end,
      opts
    )
  end
end
