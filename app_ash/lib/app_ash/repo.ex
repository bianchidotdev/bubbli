defmodule AppAsh.Repo do
  use AshPostgres.Repo,
    otp_app: :app_ash

  def installed_extensions do
    ["uuid-ossp", "citext"]
  end
end
