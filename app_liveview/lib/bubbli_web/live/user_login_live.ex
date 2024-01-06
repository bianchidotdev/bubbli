defmodule BubbliWeb.UserLoginLive do
  use BubbliWeb, :live_view

  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-sm">
      <.header class="text-center">
        Sign in to account
        <:subtitle>
          Don't have an account?
          <.link navigate={~p"/users/register"} class="font-semibold text-brand hover:underline">
            Sign up
          </.link>
          for an account now.
        </:subtitle>
      </.header>

      <%!-- action={~p"/users/log_in"} --%>
      <.simple_form
        for={@form}
        id="login_form"
        phx-update="ignore"
        phx-hook="LoginFormHook"
      >
        <.input field={@form[:email]} type="email" label="Email"  />
        <.input field={@form[:passphrase]} type="password" label="Passphrase"  />

        <:actions>
          <.input field={@form[:remember_me]} type="checkbox" label="Keep me logged in" />
          <.link href={~p"/users/reset_password"} class="text-sm font-semibold">
            Forgot your passphrase?
          </.link>
        </:actions>
        <:actions>
          <.button id={"login-button"} phx-disable-with="Signing in..." class="w-full">
            Sign in <span aria-hidden="true">→</span>
          </.button>
        </:actions>
      </.simple_form>
    </div>
    """
  end

  def mount(_params, _session, socket) do
    email = live_flash(socket.assigns.flash, :email)
    form = to_form(%{"email" => email}, as: "user")
    {:ok, assign(socket, form: form), temporary_assigns: [form: form]}
  end
end
