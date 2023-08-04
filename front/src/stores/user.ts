import { writable, type Writable } from 'svelte/store';

export interface User {
  email: string;
  salt: null | Uint8Array;
  passwordBasedEncryptionKey: null | CryptoKey;
  clientKeyPair: null | CryptoKeyPair;
  firstName: string;
}

export const user: Writable<User> = writable({
  email: '',
  salt: null,
  passwordBasedEncryptionKey: null,
  clientKeyPair: null,
  firstName: ''
});
