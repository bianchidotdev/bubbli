<script lang="ts">
  import { goto } from '$app/navigation';
  import { Stepper, Step } from '@skeletonlabs/skeleton';
  import { user } from '../../stores/user';
  import { validateEmail, registrationStart, registrationVerify } from '$lib/user';
  import { triggerError } from '$lib/error';

  let email = '',
    displayName = '',
    error: string | null,
    password = '',
    challenge = '';

  let validEmail = false;
  let emailVerified = false;
  let passwordLocked = true;

  const onEmailInput = () => {
    emailVerified = false;
    validEmail = validateEmail(email);
  };

  const verifyEmail = () => {
    submitEmailForm();
  };

  const validatePassword = () => {
    passwordLocked = password.length < 8;
    return !passwordLocked;
  };

  const registrationSubmitHandler = async () => {
    if (!validatePassword(password)) {
      triggerError('Password must be 8 characters or longer');
      return false;
    }
    submitConfirmationForm();
  };

  const submitEmailForm = async () => {
    await registrationStart(email)
      .then((response) => {
        if (response.status === 200) {
          response.json().then((data) => {
            user.set({
              email: email,
              displayName: displayName
            });
            challenge = data.challenge;
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

  const submitConfirmationForm = async () => {
    try {
      registrationVerify(password, challenge).then((response) => {
        console.log(response);
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

    <Stepper on:complete={registrationSubmitHandler}>
      <Step locked={!emailVerified}>
        <svelte:fragment slot="header">Basic Information</svelte:fragment>

        <label class="label">
          <span>Display Name</span>
          <input
            class="input"
            bind:value={displayName}
            name="display name"
            type="text"
            aria-label="Display Name"
            placeholder="Jay Smith"
            required
          />
        </label>
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
              placeholder="jaysmith@example.com"
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
    </Stepper>
  </div>
  <p class="center">Already a user? <a href="/login">Login</a>.</p>
</section>
