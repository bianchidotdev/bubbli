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

const initialUser = {
  email: '',
  id: '',
  salt: null,
  clientPublicKey: null,
  displayName: '',
  username: ''
}
export const userStore: Writable<User | null> = localStorageStore('currentUser', initialUser);

export const clearUserStore = () => {
  userStore.set(initialUser);
}
