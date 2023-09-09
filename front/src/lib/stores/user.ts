import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';

export interface User {
  email: string;
  id: string;
  salt: null | Uint8Array;
  passwordBasedEncryptionKey: null | CryptoKey;
  clientKeyPair: null | CryptoKeyPair;
  displayName: string;
  username: string;
}

export const user: Writable<User | null> = localStorageStore('currentUser', {
  email: '',
  id: '',
  salt: null,
  passwordBasedEncryptionKey: null,
  clientKeyPair: null,
  displayName: '',
  username: ''
});
