import { hydrateRegistration } from "./user"

export const RegistrationHook = {
  mounted() {
    this.el.addEventListener("submit", async e => {
      e.preventDefault()

      console.log("debug event", e.target)
      const email = e.target.user_email.value
      const passphrase = e.target.user_passphrase.value
      if (!email || !passphrase) {
        return
      }
      const user = await hydrateRegistration(email, passphrase)

      console.log("user", user)
      this.pushEvent("save", { user: user })

      const formData = new FormData()
      formData.append('email', email)
      formData.append('authentication_hash', user.authentication_hash)

      const response = await fetch('/users/log_in', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        console.error('Login failed')
        return
      }

      const loginResponse = await response.json()
      console.log("loginResponse", loginResponse)
    })

    // this.handleEvent('redirect', ({ path }) => {
    //   window.location.href = path;
    // })
  }
}