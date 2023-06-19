<script>
  import { user } from "../../../stores/user"
  import { BASE_API_URI } from "$lib/constants";
  let error;
  let password = "";

  const validatePassword = (pw) => {
    return pw.length >= 8;
  }

  const submitForm = async () => {
    await fetch(`${BASE_API_URI}/registration/finish`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          // notificationData.set('Registration successful. Login now.');
          response.json().then((data) => {
            console.log(data);
          });
        } else if (response.status === 400) {
          response.json().then((data) => {
            error = data.errors.detail;
            console.log(data)
          })
        } else {
          response.json().then((data) => {
            console.log(data)
          })
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
  <h1>Hello {$user.firstName}</h1>
  {#if error}
    <p class="center error">{error}</p>
  {/if}
  <p class="center">{$user.email}</p>
  <form class="form" on:submit|preventDefault={submitForm}>
    <input
      bind:value={password}
      name="password"
      type="password"
      aria-label="Password"
      placeholder="Password"
      required
    />
    <button class="btn" type="submit" disabled={!validatePassword(password)}>Submit</button>
  </form>
</section>
