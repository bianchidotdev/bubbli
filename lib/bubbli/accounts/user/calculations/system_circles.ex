defmodule Bubbli.Accounts.User.Calculations.SystemCircles do
  @moduledoc """
  An Ash calculation that returns the list of system circles for a user.

  System circles are defined in code (not the database), so they are always
  up-to-date without requiring migrations. Every user gets the same set.
  """

  use Ash.Resource.Calculation

  @impl true
  def calculate(records, _opts, _context) do
    system_circles = Bubbli.Social.SystemCircle.all()

    {:ok, Enum.map(records, fn _user -> system_circles end)}
  end
end
