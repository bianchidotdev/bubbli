<script>
  import { get } from 'svelte/store';
  import { userStore } from '$lib/stores/user_store';
  import {
    encryptionKeyStore,
    masterEncryptionKeyConst,
    masterPrivateKeyConst
  } from '$lib/stores/encryption_key_store';
  const user = get(userStore);
  const encryptionKey = encryptionKeyStore.get(masterEncryptionKeyConst);
  const privateKey = encryptionKeyStore.get(masterPrivateKeyConst);
  console.log(encryptionKey, privateKey);
</script>

<div class="flex flex-row justify-center items-center mb-4">
  <h2>Protected Area</h2>
</div>

<hr class="!border-t-2 mt-2 mb-6" />

<p>Hello {JSON.stringify(user)}</p>

<p>
  Private Key: {privateKey && privateKey.type} - {privateKey &&
    privateKey.algorithm &&
    privateKey.algorithm.name}
</p>
<p>
  Encryption Key: {encryptionKey && encryptionKey.type} - {encryptionKey &&
    encryptionKey.algorithm &&
    encryptionKey.algorithm.name}
</p>
