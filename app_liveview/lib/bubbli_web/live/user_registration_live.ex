defmodule BubbliWeb.UserRegistrationLive do
  use BubbliWeb, :live_view

  alias Bubbli.Accounts
  alias Bubbli.Accounts.User

  def render(assigns) do
    ~H"""
    <div class="mx-auto max-w-sm">
      <.header class="text-center">
        Register for an account
        <:subtitle>
          Already registered?
          <.link navigate={~p"/users/log_in"} class="font-semibold text-brand hover:underline">
            Sign in
          </.link>
          to your account now.
        </:subtitle>
      </.header>

      <%!-- email: normalized_input.email,
        display_name: normalized_input.display_name,
        username: normalized_input.username,
        master_public_key: normalized_input.public_key,
        client_keys: normalized_input.client_keys,
        timeline_key_map: normalized_input.timeline_key,
        master_password_hash: normalized_input.master_password_hash --%>

      <%!-- action={~p"/users/log_in?_action=registered"} --%>
      <%!-- phx-trigger-action={@trigger_submit} --%>
      <%!-- phx-submit="ignore" --%>
      <.simple_form
        for={@form}
        id="registration_form"
        phx-hook="RegistrationFormHook"
        data-registration-successful={@registration_successful}
      >
        <.error :if={@check_errors}>
          Oops, something went wrong! Please check the errors below.
        </.error>

        <.input field={@form[:email]} type="email" label="Email" phx-change="validate" />
        <div phx-update="ignore" id="passphrase-div-for-ignore">
          <.input field={@form[:passphrase]} type="password" label="Passphrase" />
        </div>
        <:actions>
          <.register_button />
        </:actions>
      </.simple_form>
    </div>
    """
  end

  defp register_button(assigns) do
    ~H"""
    <.button id={"registration-button"} phx-disable-with="Creating account..." class="w-full">
      Create an account
    </.button>
    """
  end

  def mount(_params, _session, socket) do
    changeset = Accounts.change_user_registration(%User{})

    socket =
      socket
      # TODO: why do I need to specify the attribute as string for it to be visible in the DOM?
      |> assign(trigger_submit: false, registration_successful: ~c"false", check_errors: false)
      |> assign_form(changeset)

    {:ok, socket, temporary_assigns: [form: nil]}
  end

  def handle_event("ignore", _params, socket) do
    {:noreply, socket}
  end

  def handle_event("save", %{"user" => user_params}, socket) do
    case Accounts.register_user(user_params) do
      {:ok, user} ->
        {:ok, _} =
          Accounts.deliver_user_confirmation_instructions(
            user,
            &url(~p"/users/confirm/#{&1}")
          )

        changeset = Accounts.change_user_registration(user)

        {:noreply,
         socket
         |> assign(trigger_submit: true, registration_successful: ~c"true")
         |> assign_form(changeset)}

      {:error, %Ecto.Changeset{} = changeset} ->
        {:noreply, socket |> assign(check_errors: true) |> assign_form(changeset)}
    end
  end

  def handle_event("validate", %{"user" => user_params}, socket) do
    changeset = Accounts.change_user_registration_validation(%User{}, user_params)
    dbg(changeset)
    {:noreply, assign_form(socket, Map.put(changeset, :action, :validate))}
  end

  defp assign_form(socket, %Ecto.Changeset{} = changeset) do
    form = to_form(changeset, as: "user")

    if changeset.valid? do
      assign(socket, form: form, check_errors: false)
    else
      assign(socket, form: form)
    end
  end
end