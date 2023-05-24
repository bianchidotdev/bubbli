defmodule PrivateSocial.Repo do
  use Ecto.Repo,
    otp_app: :private_social,
    adapter: Ecto.Adapters.Postgres
end
