<script lang="ts">
  import { goto } from '$app/navigation';

  import { toByteArray } from 'base64-js';

  import { Stepper, Step } from '@skeletonlabs/skeleton';

  import {
    validateEmail,
    login,
    decryptAndLoadMasterPrivateKey,
    decryptAndLoadEncryptionKeys
  } from '$lib/user';

  import { deserializeWrapAlgorithm } from '$lib/crypto';
  import { triggerError } from '$lib/error';
  import { userStore } from '$lib/stores/user_store';

  let error = null;

  let email = '';
  let validEmail = false;
  let password = '';
  let passwordLocked = true;

  // TODO: it'd be nice to standardize form validation
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

  const submitLoginForm = async () => {
    const response = await login(email, password);
    if (response.status === 200) {
      const json = await response.json();
      userStore.set({
        ...json['user'],
        email: email
      });

      // TODO: json validate
      // if (encryptedPrivateKey.length === 0 || encryptedPrivateKeyIV.length === 0 || encryptionKeys.length === 0) {
      //   triggerError('Unknown error getting keys from server');
      //   goto(`/login`);
      // }

      try {
        const clientKey = json['client_key'];
        const encryptedPrivateKey = {
          protected_private_key: toByteArray(clientKey['protected_private_key']),
          key_algorithm: (({ name, hash }) => ({ name, hash: hash.name }))(clientKey['key_algorithm']),
          key_usages: clientKey['key_usages'],
          wrap_algorithm: deserializeWrapAlgorithm(clientKey['wrap_algorithm'])
        };
        const rawEncryptionKeys = json['encryption_keys'];
        console.log("rawEncryptionKeys", rawEncryptionKeys)
        const encryptionKeys = rawEncryptionKeys.map((key: any) => {
          return {
            encryption_context_id: key['encryption_context_id'],
            protected_encryption_key: toByteArray(key['protected_encryption_key']),
            key_algorithm: key['key_algorithm'],
            key_usages: key['key_usages'],
            wrap_algorithm: key['wrap_algorithm']
          };
        });
        console.log("encryptionKeys", encryptionKeys)

        const masterPrivateKey = await decryptAndLoadMasterPrivateKey(
          encryptedPrivateKey.protected_private_key,
          encryptedPrivateKey.wrap_algorithm,
          encryptedPrivateKey.key_algorithm,
          encryptedPrivateKey.key_usages
        );
        console.log("loading encryption keys with", masterPrivateKey, encryptionKeys)
        await decryptAndLoadEncryptionKeys(masterPrivateKey, encryptionKeys);
        goto(`/dashboard`);
      } catch (error) {
        console.error(error);
        triggerError('Unknown error getting keys from server');
        goto(`/login`);
      }
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
