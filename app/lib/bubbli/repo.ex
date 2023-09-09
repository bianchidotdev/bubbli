defmodule Bubbli.Repo do
  use Ecto.Repo,
    otp_app: :bubbli,
    adapter: Ecto.Adapters.Postgres
end
