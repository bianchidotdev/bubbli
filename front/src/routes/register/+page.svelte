<script lang="ts">
  import { goto } from '$app/navigation';
  import { BASE_API_URI } from '$lib/constants.ts'; // TODO: why is .ts needed
  import { fromByteArray } from 'base64-js';
  import {
    generatePasswordBasedEncryptionKey,
    generateClientKeyPair,
    signMessage,
    encryptCryptoKey,
    base64EncodeArrayBuffer
  } from '$lib/crypto';
  import { Stepper, Step } from '@skeletonlabs/skeleton';
  import { toastStore } from '@skeletonlabs/skeleton';
  import type { ToastSettings } from '@skeletonlabs/skeleton';
  import { registrationStart } from './register.ts';
  import { user } from '../../stores/user';
  import { isAuthenticated } from '../../stores/authenticated';

  let email = '',
    firstName = '',
    error: string | null,
    password = '',
    challenge = '';

  const BasicInformation = 'BasicInformation';
  const formSteps = {
    0: BasicInformation
    // 1: "Password"
  };

  let basicInformationLocked = true;
  let validEmail = false;
  let emailVerified = false;
  let passwordLocked = true;

  const triggerError = (message) => {
    const t: ToastSettings = {
      message: message,
      background: 'variant-filled-error'
    };
    toastStore.trigger(t);
  };

  const onEmailInput = () => {
    emailVerified = false;
    validateEmail();
  };
  const emailRegex = /^.+@.+\..+$/;
  const validateEmail = () => {
    validEmail = !!email.match(emailRegex);
  };

  const verifyEmail = () => {
    submitEmailForm();
  };

  const validatePassword = () => {
    passwordLocked = password.length < 8;
    return !passwordLocked;
  };

  const registrationNextHandler = async (e) => {
    switch (formSteps[e.detail.step]) {
      case BasicInformation:
        console.log('Advancing to password step');
      //submitEmailForm();
    }
  };

  const registrationSubmitHandler = async () => {
    if (!validatePassword(password)) {
      triggerError('Password must be 8 characters or longer');
      return false;
    }
    submitConfirmationForm();
  };

  const submitEmailForm = async () => {
    await registrationStart(email, firstName)
      .then((response) => {
        if (response.status === 200) {
          response.json().then((data) => {
            $user.email = email;
            challenge = data.challenge;
            basicInformationLocked = false;
            emailVerified = true;
          });
        } else if (response.status === 409) {
          triggerError('Account already exists');
        } else {
          console.log(response.json());
        }
      })
      .catch((error) => {
        error = error;
        console.error('Error:', error);
      });
  };

  const submitConfirmationForm = async () => {
    try {
      $user.salt = window.crypto.getRandomValues(new Uint8Array(32));
      const privateKeyEncryptionIV = crypto.getRandomValues(new Uint8Array(12));
      // generate keys
      $user.passwordBasedEncryptionKey = await generatePasswordBasedEncryptionKey(
        password,
        $user.salt
      );
      $user.clientKeyPair = await generateClientKeyPair();
      const signedChallenge = await signMessage($user.clientKeyPair, challenge);
      const publicKey = await crypto.subtle.exportKey('spki', $user.clientKeyPair.publicKey);
      const pemExportedPublicKey = `-----BEGIN PUBLIC KEY-----\n${base64EncodeArrayBuffer(
        publicKey
      )}\n-----END PUBLIC KEY-----`;
      const encPrivateKey = await encryptCryptoKey(
        $user.passwordBasedEncryptionKey,
        $user.clientKeyPair.privateKey,
        privateKeyEncryptionIV
      );
      const clientKeys = [
        {
          type: 'password',
          encryption_iv: fromByteArray(privateKeyEncryptionIV)
        }
        // TODO(bianchi): Recovery codes
      ];
      await fetch(`${BASE_API_URI}/registration/confirm`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          first_name: $user.firstName,
          challenge: challenge,
          signed_challenge: base64EncodeArrayBuffer(signedChallenge),
          salt: fromByteArray($user.salt),
          public_key: pemExportedPublicKey,
          encrypted_private_key: base64EncodeArrayBuffer(encPrivateKey),
          client_keys: clientKeys
        })
      })
        .then((response) => {
          console.log(response);
          if (response.status === 200) {
            response.json().then((json) => {
              console.log(json);
              user.set({
                id: json['user_id'],
                email: email
              });
              isAuthenticated.set(true);
              goto(`/`);
            });
          }
        })
        .catch((error) => {
          console.log('error registering', error);
        });
    } catch (e) {
      console.log('Error occurred creating encryption keys - ', e);
    }
  };
</script>

<svelte:head>
  <title>Register</title>
  <meta name="description" content="User Registration" />
</svelte:head>

<section class="container mx-auto">
  <div class="card p-4 m-6 md:mx-auto max-w-2xl">
    <h1>Register</h1>
    {#if error}
      <p class="center error">{error}</p>
    {/if}

    <Stepper on:complete={registrationSubmitHandler} on:next={registrationNextHandler}>
      <Step locked={!emailVerified}>
        <svelte:fragment slot="header">Basic Information</svelte:fragment>

        <label class="label">
          <span>Email</span>
          <div class="w-full grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input
              class="input sm:col-span-3 {email.length === 0
                ? ''
                : validEmail
                ? 'input-success'
                : 'input-error'}"
              bind:value={email}
              on:input={onEmailInput}
              name="email"
              type="email"
              aria-label="Email address"
              placeholder="Email address"
              required
            />
            {#if !emailVerified}
              <button
                class="btn sm:w-full px-10 ml-auto variant-ghost-secondary"
                disabled={!validEmail}
                on:click={verifyEmail}>Verify</button
              >
            {:else}
              <button class="btn sm:w-full px-10 ml-auto variant-filled-secondary" disabled
                >Verified!</button
              >
            {/if}
          </div>
        </label>
      </Step>
      <Step locked={passwordLocked}>
        <svelte:fragment slot="header">Security</svelte:fragment>
        <label class="label">
          <span>Password</span>
          <input
            class="input {password.length === 0
              ? ''
              : passwordLocked
              ? 'input-error'
              : 'input-success'}"
            bind:value={password}
            on:input={validatePassword}
            name="password"
            type="password"
            aria-label="Password"
            placeholder="Password"
            required
          />
        </label>
        {#if passwordLocked}
          <p class="alert-message">Password must be 8 characters or more</p>
        {:else}
          <p class="success">😎 Password meets minimum rules</p>
        {/if}
      </Step>
      <!-- ... -->
    </Stepper>

    <p>Challenge: {challenge}</p>
    <p>Salt: {$user.salt}</p>
  </div>
  <p class="center">Already a user? <a href="/login">Login</a>.</p>
</section>
