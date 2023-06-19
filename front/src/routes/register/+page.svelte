<script lang="ts">
  import { goto } from "$app/navigation";
  import { BASE_API_URI } from "$lib/constants";
  import { writable } from 'svelte/store';
  import { user } from "../../stores/user"

  let email = "",
    error: string | null;

  const challenge = writable("");

  const emailRegex = /.+@.+\..+/;
  const validateEmail = (email: string) => {
    return !!email.match(emailRegex);
  }



  const submitForm = async () => {
    await fetch(`${BASE_API_URI}/registration/start`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          // notificationData.set('Registration successful. Login now.');
          response.json().then((data) => {
            console.log(data);
            $user.email = email;
            $user.salt = data.sale;
            $challenge = data.challenge;
            goto(`/register/confirm`)
          });
        } else if (response.status === 400) {
          console.log(response.json());
        } else {
          console.log(response.json());
        }
      })
      .catch((error) => {
        error = error;
        console.error("Error:", error);
      });
  };
</script>

<svelte:head>
  <title>Register</title>
  <meta name="description" content="User Registration" />
</svelte:head>

<section class="container">
  <h1>Register</h1>
  {#if error}
    <p class="center error">{error}</p>
  {/if}

  <form class="form" on:submit|preventDefault={submitForm}>
    <input
      bind:value={$user.firstName}
      name="firstName"
      aria-label="First name"
      placeholder="First name"
      required
    />
    <input
      bind:value={email}
      name="email"
      type="email"
      aria-label="Email address"
      placeholder="Email address"
      required
    />
    <button class="btn" type="submit" disabled={!validateEmail(email)}>Submit</button>
  </form>
  <p>Challenge: {$challenge}</p>
  <p>Salt: {$user.salt}</p>
  <p class="center">Already a user? <a href="/login">Login</a>.</p>
</section>
