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
    })
  }
}