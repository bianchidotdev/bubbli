<script lang="ts">
  import { goto } from '$app/navigation';

  import { toByteArray } from 'base64-js';

  import { Stepper, Step } from '@skeletonlabs/skeleton';

  import {
    validateEmail,
    login,
    decryptAndLoadMasterPrivateKey
  } from '$lib/user';
  import { triggerError } from '$lib/error';
  import { userStore } from '$lib/stores/user_store';
  import { get } from 'svelte/store';

  let error = null;

  let email = '';
  let validEmail = false;

  let password = '';
  let passwordLocked = true;

  const onEmailInput = () => {
    validEmail = validateEmail(email);
  };

  const validatePassword = () => {
    passwordLocked = password.length <= 0;
    return !passwordLocked;
  };

  const loginSubmitHandler = () => {
    submitLoginForm();
  };

 // const verifyEmail = () => {
 //   submitEmailForm();
 // };

 // const submitEmailForm = async () => {
 //   await loginStart(email)
 //     .then((response) => {
 //       if (response.status === 200) {
 //         response.json().then((data) => {
 //           console.log(data);
 //           userStore.set({
 //             email: email,
 //             salt: toByteArray(data.user.salt)
 //           });
 //           emailVerified = true;
 //         });
 //       } else if (response.status === 409) {
 //         triggerError('Account already exists');
 //       } else {
 //         response.json().then((data) => {
 //           console.log(data);
 //         });
 //       }
 //     })
 //     .catch((error) => {
 //       error = error;
 //       console.error('Error:', error);
 //     });
 // };

  const submitLoginForm = async () => {
    const response = await login(email, password);
    if (response.status === 200) {
      const json = await response.json();
      userStore.set({
        id: json['user_id'],
        email: email,
        authenticated: true
      });

      const encryptedPrivateKey = toByteArray(json['encrypted_master_private_key']);
      const encryptedPrivateKeyIV = toByteArray(json['encrypted_master_private_key_iv']);

      decryptAndLoadMasterPrivateKey(encryptedPrivateKey, encryptedPrivateKeyIV)
        .then(() => {
          goto(`/dashboard`);
        })
        .catch((error) => {
          console.error(error);
          triggerError('Unknown error getting keys from server');
          goto(`/login`);
        });
    } else {
      console.log(await response.json());
    }
  };
</script>

<svelte:head>
  <title>Login</title>
  <meta name="description" content="User Login" />
</svelte:head>

<section class="container mx-auto">
  <div class="card p-4 m-6 md:mx-auto max-w-2xl">
    <h1>Login</h1>
    {#if error}
      <p class="center error">{error}</p>
    {/if}

    <Stepper on:complete={loginSubmitHandler}>
      <Step locked={!validEmail}>
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
      </Step>
    </Stepper>
  </div>
</section>
