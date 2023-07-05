<script lang="ts">
  import { goto } from "$app/navigation";
  import { BASE_API_URI } from "$lib/constants";
  import { user } from "../../stores/user"
  import { fromByteArray } from "base64-js";
  import { generatePasswordBasedEncryptionKey, generateClientKeyPair, signMessage, encryptCryptoKey, base64EncodeArrayBuffer } from "$lib/crypto"


  let email = "",
    error: string | null,
    password = "",
    challenge = "";

  let formStep = "Email";

  const emailRegex = /.+@.+\..+/;
  const validateEmail = (email: string) => {
    return !!email.match(emailRegex);
  }

  const validatePassword = (pw: string) => {
    return pw.length >= 8;
  }

  const submitEmailForm = async () => {
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
            $user.email = email;
            challenge = data.challenge;
            formStep = "Confirmation";
          });
        } else {
          console.log(response.json());
        }
      })
      .catch((error) => {
        error = error;
        console.error("Error:", error);
      });
  }

  const submitConfirmationForm = async () => {
    try {
      $user.salt = window.crypto.getRandomValues(new Uint8Array(32));
      const privateKeyEncryptionIV = crypto.getRandomValues(new Uint8Array(12));
      // generate keys
      $user.passwordBasedEncryptionKey = await generatePasswordBasedEncryptionKey(password, $user.salt);
      $user.clientKeyPair = await generateClientKeyPair();
      const signedChallenge = await signMessage($user.clientKeyPair, challenge);
      const publicKey = await crypto.subtle.exportKey("spki", $user.clientKeyPair.publicKey);
      const pemExportedPublicKey = `-----BEGIN PUBLIC KEY-----\n${base64EncodeArrayBuffer(publicKey)}\n-----END PUBLIC KEY-----`;
      const encPrivateKey = await encryptCryptoKey($user.passwordBasedEncryptionKey, $user.clientKeyPair.privateKey, privateKeyEncryptionIV);
      const clientKeys = [
        {
          type: "password",
          encryption_iv: fromByteArray(privateKeyEncryptionIV)
        }
        // TODO(bianchi): Recovery codes
      ]
      await fetch(`${BASE_API_URI}/registration/confirm`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          first_name: $user.firstName,
          challenge: challenge,
          signed_challenge: base64EncodeArrayBuffer(signedChallenge),
          salt: fromByteArray($user.salt),
          public_key: pemExportedPublicKey,
          encrypted_private_key: base64EncodeArrayBuffer(encPrivateKey),
          client_keys: clientKeys,
        })
      });
    } catch (e) {
      console.log("Error occurred creating encryption keys - ", e);
    }
  }

  const submitForm = async () => {
    if (formStep === "Email") {
      submitEmailForm();
    } else if (formStep === "Confirmation") {
      submitConfirmationForm();
    }
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
    {#if formStep === "Email"}
      <label>
        First Name
        <input
          bind:value={$user.firstName}
          name="firstName"
          aria-label="First name"
          placeholder="First name"
          required
        />
      </label>
      <label>
        Email
        <input
          bind:value={email}
          name="email"
          type="email"
          aria-label="Email address"
          placeholder="Email address"
          required
        />
      </label>

      <button class="btn" type="submit" disabled={!validateEmail(email)}>Next</button>

    {:else if formStep === "Confirmation"}
      <input
        bind:value={password}
        name="password"
        type="password"
        aria-label="Password"
        placeholder="Password"
        required
      />
      <button class="btn" type="submit" disabled={!validatePassword(password)}>Submit</button>
    {/if}
  </form>
  <p>Challenge: {challenge}</p>
  <p>Salt: {$user.salt}</p>
  <p class="center">Already a user? <a href="/login">Login</a>.</p>
</section>

