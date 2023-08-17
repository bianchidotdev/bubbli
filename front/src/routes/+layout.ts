import { get } from 'svelte/store';
import { user } from '../stores/user';
import { getCurrentUser } from '$lib/user';

export const ssr = false;

export const load: LayoutLoad = async ( fetch, params ) => {
  let currentUser = get(user);
  if (currentUser && currentUser.email && user.email !== '') {
    console.log('already logged in as ', currentUser.email);
  } else {
    currentUser = await getCurrentUser();
    if (currentUser && currentUser.email !== '') {
      console.log('fetched currentUser data for ', user.email);
      user.set(currentUser);
    } else {
      user.set(null);
    }
  }
  //if (!currentUser.email || $uesr.email === '') {
  //    goto('/')
  //}
};
