import { hydrateLogin, hydrateRegistration, submitLogin } from "./user"

export const RegistrationHook = {
  mounted() {
    this.el.addEventListener("submit", async e => {
      e.preventDefault()
      let button = document.querySelector('#registration-button') as HTMLButtonElement;
      if (!button) {
        console.error('No button found')
        return
      }
      button.disabled = true;

      console.log("debug event", e.target)
      const email = e.target.user_email.value
      const passphrase = e.target.user_passphrase.value
      if (!email || !passphrase) {
        return
      }
      const user = await hydrateRegistration(email, passphrase)

      console.log("user", user)
      this.pushEvent("save", { user: user })
      button.disabled = false;
    })
  },
  updated() {
    const registrationSuccessful = this.el.getAttribute('data-registration-successful')
    console.log("registrationSuccessful", registrationSuccessful)
    if (registrationSuccessful === 'true') {
      console.log("attempting login")
      hydrateLogin(this.el.user_email.value, this.el.user_passphrase.value)
        .then((user) => {
          console.log("hydrated user", user)
          submitLogin(user).then((resp) => {
            console.log("response", resp)
            console.log("logged in user", user)
            window.location.href = '/'
          })
        })
    }
  }

}

export const LoginHook = {
  mounted() {
    this.el.addEventListener("submit", async e => {
      e.preventDefault()

      let button = document.querySelector('#login-button') as HTMLButtonElement;
      if (!button) {
        console.error('No button found')
        return
      }
      button.disabled = true;

      // TODO: call form save for login to be able to show errors

      console.log("debug event", e.target)
      const email = e.target.user_email.value
      const passphrase = e.target.user_passphrase.value
      if (!email || !passphrase) {
        console.error('Missing email or passphrase')
        return
      }
      const user = await hydrateLogin(email, passphrase)

      console.log("user", user)
      try {
        const response = await submitLogin(user)
        console.log(response)
        if (!response.ok) {
          console.error('Login failed')
          return
        }
        console.log("logged in user", user)
        window.location.href = '/'
        window.location.reload();
      } catch (error) {
        console.error(error)
      }
      button.disabled = false;
    })
  }
}