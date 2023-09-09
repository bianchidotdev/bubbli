import { get } from 'svelte/store';
import { userStore } from '$lib/stores/user_store';
import { getCurrentUser } from '$lib/user';

export const ssr = false;

export const load: LayoutLoad = async ({ fetch }) => {
  let user = get(userStore);
  if (user && user.email && user.email !== '') {
    console.log('already logged in as ', user.email);
  } else {
    user = await getCurrentUser(fetch);
    if (user && user.email !== '') {
      console.log('fetched user data for ', user.email);
      userStore.set(user);
    } else {
      userStore.set({});
    }
  }
  //if (!user.email || $uesr.email === '') {
  //    goto('/')
  //}
};
