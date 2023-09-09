<script lang="ts">
  import { ConicGradient } from '@skeletonlabs/skeleton';
  import type { ConicStop } from '@skeletonlabs/skeleton';
  import { superForm } from 'sveltekit-superforms/client';
  //import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  import { userSchema } from '$lib/config/zod-schemas';
  import { AlertTriangle } from 'lucide-svelte';

  import {
    generatePasswordBasedEncryptionKeyArgon2,
    generateMasterPasswordHashArgon2
  } from '$lib/crypto';

  export let data;

  const encoder = new TextEncoder();
  const signInSchema = userSchema.pick({ email: true, password: true });
  const { form, errors, enhance, delayed } = superForm(data.form, {
    onSubmit({ formData }) {
      const email = formData.get('email');
      const password = formData.get('password');
      // TODO: should salt be the username
      const salt = encoder.encode(email);
      // these need to be async :(
      const passwordBasedEncryptionKey = generatePasswordBasedEncryptionKeyArgon2(password, salt);
      const masterHashedPassword = generateMasterPasswordHashArgon2(
        passwordBasedEncryptionKey,
        password
      );
      formData.set('password', null);
      formData.set('master_hashed_password', masterHashedPassword);
    },
    taintedMessage: null,
    validators: signInSchema,
    delayMs: 0
  });
  const conicStops: ConicStop[] = [
    { color: 'transparent', start: 0, end: 25 },
    { color: 'rgb(var(--color-primary-900))', start: 75, end: 100 }
  ];
</script>

<form method="POST" action="/api/v1/auth/signin" use:enhance>
  <!--<SuperDebug data={$form} />-->
  {#if $errors._errors}
    <aside class="alert variant-filled-error mt-6">
      <!-- Icon -->
      <div><AlertTriangle size="42" /></div>
      <!-- Message -->
      <div class="alert-message">
        <h3 class="h3">Sign In Problem</h3>
        <p>{$errors._errors}</p>
      </div>
    </aside>
  {/if}
  <div class="mt-6">
    <label class="label">
      <span>Email</span>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="jaesmith@example.com"
        autocomplete="email"
        data-invalid={$errors.email}
        bind:value={$form.email}
        class="input"
        class:input-error={$errors.email}
      />
      {#if $errors.email}
        <small>{$errors.email}</small>
      {/if}
    </label>
  </div>

  <div class="mt-6">
    <label class="label">
      <span>Password</span>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="P4$sw0rd"
        data-invalid={$errors.password}
        bind:value={$form.password}
        class="input"
        class:input-error={$errors.password}
      />
      {#if $errors.password}
        <small>{$errors.password}</small>
      {/if}
    </label>
  </div>

  <div class="mt-6">
    <button type="submit" class="btn variant-filled-primary w-full"
      >{#if $delayed}<ConicGradient stops={conicStops} spin width="w-6" />{:else}Sign In{/if}</button
    >
  </div>
  <div class="flex flex-row justify-center items-center mt-10">
    <a href="/auth/password/reset" class="font-semibold">Forgot Password</a>
  </div>
</form>
