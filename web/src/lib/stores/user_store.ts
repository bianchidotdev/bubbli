import type { Timeline } from '$lib/timelines';
import { localStorageStore } from '@skeletonlabs/skeleton';
import type { Writable } from 'svelte/store';

export interface User {
  email: string;
  id: string;
  salt: null | Uint8Array;
  client_public_key: null | CryptoKey
  display_name: string;
  username: string;
  home_timeline: null | Timeline;
}

const initialUser = {
  email: '',
  id: '',
  salt: null,
  client_public_key: null,
  display_name: '',
  username: '',
  home_timeline: null,
}

export const userStore: Writable<User | null> = localStorageStore('currentUser', initialUser);

export const clearUserStore = () => {
  userStore.set(initialUser);
}
