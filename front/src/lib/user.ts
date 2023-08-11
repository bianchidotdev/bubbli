import { getCurrentUser } from '$lib/user.ts';

export const getCurrentUser = async () => {
  return fetch(`${BASE_API_URI}/user/`, {});
};
