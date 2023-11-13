defmodule BubbliWeb.ErrorJSON do
  # If you want to customize a particular status code,
  # you may add your own clauses, such as:
  #
  # def render("500.json", _assigns) do
  #   %{errors: %{message: "Internal Server Error"}}
  # end

  # By default, Phoenix returns the status message from
  # the template name. For example, "404.json" becomes
  # "Not Found".

  def render("401.json", _assigns) do
    %{errors: %{message: "unauthorized"}}
  end

  def render(template, _assigns) do
    %{errors: %{message: Phoenix.Controller.status_message_from_template(template)}}
  end
end
