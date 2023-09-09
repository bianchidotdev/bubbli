import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { userStore } from '$lib/stores/user_store';
import { getCurrentUser } from '$lib/user';

export const ssr = false;

export const load: LayoutLoad = async () => {
  let user = get(userStore);
  if (user && user.email && user.email !== '') {
    console.log('already logged in as ', user.email);
  } else {
    console.log('Not logged in, redirecting to login');
    goto(`/login`);
  }
};
