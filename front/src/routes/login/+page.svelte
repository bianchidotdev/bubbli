<script lang="ts">
  import { goto } from '$app/navigation';

  import { Stepper, Step } from '@skeletonlabs/skeleton';

  import { validateEmail, loginStart, loginVerify } from '$lib/user';
  import { triggerError } from '$lib/error';
  import { user } from '../../stores/user';
  import { get } from 'svelte/store';

  // import { User } from "lucide-svelte"
  // import SignIn from '$lib/components/SignIn.svelte';

  import { toByteArray } from 'base64-js';

  let error = null;

  let email = '';
  let validEmail = false;
  let emailVerified = false;

  let password = '';
  let passwordLocked = true;

  const onEmailInput = () => {
    emailVerified = false;
    validEmail = validateEmail(email);
  };

  const validatePassword = () => {
    passwordLocked = password.length <= 0;
    return !passwordLocked;
  };

  const loginSubmitHandler = () => {
    submitVerifyForm();
  };

  const verifyEmail = () => {
    submitEmailForm();
  };

  const submitEmailForm = async () => {
    await loginStart(email)
      .then((response) => {
        if (response.status === 200) {
          response.json().then((data) => {
            console.log(data);
            user.set({
              email: email,
              salt: toByteArray(data.user.salt)
            });
            emailVerified = true;
          });
        } else if (response.status === 409) {
          triggerError('Account already exists');
        } else {
          response.json().then((data) => {
            console.log(data);
          });
        }
      })
      .catch((error) => {
        error = error;
        console.error('Error:', error);
      });
  };

  const submitVerifyForm = async () => {
    const userStore = get(user);
    loginVerify(email, password, userStore.salt)
      .then((response) => {
        if (response.status === 200) {
          response.json().then((json) => {
            console.log(json);
            user.set({
              id: json['user_id'],
              email: email,
              authenticated: true
            });
            goto(`/dashboard`);
          });
        }
      })
      .catch((error) => {
        console.log('Error logging in', error);
      });
  };
</script>

<svelte:head>
  <title>Login</title>
  <meta name="description" content="User Login" />
</svelte:head>

<section class="container mx-auto">
  <!-- <div class="flex max-w-md flex-col justify-center px-6 py-12 lg:px-8 mx-auto">
       <div class="card p-6 pb-8 pt-8">
       <div>
       <div class="flex flex-row justify-center items-center mb-4">
       <User />
       </div>
       <SignIn {data} />
       </div>
       </div>
       </div> -->
  <div class="card p-4 m-6 md:mx-auto max-w-2xl">
    <h1>Login</h1>
    {#if error}
      <p class="center error">{error}</p>
    {/if}

    <Stepper on:complete={loginSubmitHandler}>
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
      </Step>
    </Stepper>
  </div>
</section>
