<script lang="ts">
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte'
  import { Stepper, Step } from '@skeletonlabs/skeleton';
  import { userStore } from '$lib/stores/user_store';
  import { validateEmail, register } from '$lib/user';
  import { triggerError } from '$lib/error';

  let user;
  const unsubscribe = userStore.subscribe((value) => user = value)
  onDestroy(unsubscribe)
  let email = '',
    displayName = '',
    username = '',
    error: string | null,
    password = ''

  let validEmail = false;
  let passwordLocked = true;

  const onEmailInput = () => {
    validEmail = validateEmail(email);
  };

  const validatePassword = () => {
    passwordLocked = password.length < 8;
    return !passwordLocked;
  };

  const registrationSubmitHandler = async () => {
    if (!validatePassword()) {
      triggerError('Password must be 8 characters or longer');
      return false;
    }
    submitConfirmationForm();
  };

  const submitConfirmationForm = async () => {
    try {
      userStore.set({email: email, username: username, displayName: displayName})
      register(user, password).then((response) => {
        if (response.status === 200) {
          response.json().then((json) => {
            userStore.set({
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
      <Step locked={!validEmail}>
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
          <span>Username</span>
          <input
            class="input"
            bind:value={username}
            name="username"
            type="text"
            aria-label="Username"
            placeholder="jsmith"
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
