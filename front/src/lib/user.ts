import { BASE_API_URI } from '$lib/constants';
import { user } from '../stores/user';

export const getCurrentUser = async () => {
  const res = await fetch(`${BASE_API_URI}/current_user/`, {
    credentials: 'include'
  });
  if (res.status === 200) {
    res.json().then((data) => {
      console.log(data);
      return data.user;
    });
  }
  console.log('Error retrieving user data');
  return null;
};

export const logOutUser = async () => {
  const res = await fetch(`${BASE_API_URI}/auth/logout/`, {
    credentials: 'include'
  });

  user.set(null);
};
