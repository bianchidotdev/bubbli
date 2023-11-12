import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';

export interface User {
  email: string;
  id: string;
  salt: null | Uint8Array;
  clientPublicKey: null | CryptoKey
  displayName: string;
  username: string;
}

export const userStore: Writable<User | null> = localStorageStore('currentUser', {
  email: '',
  id: '',
  salt: null,
  clientPublicKey: null,
  displayName: '',
  username: ''
});
