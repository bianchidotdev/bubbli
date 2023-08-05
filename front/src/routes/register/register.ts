import { BASE_API_URI } from '$lib/constants.ts';

export const registrationStart = async (email, firstName) => {
  return fetch(`${BASE_API_URI}/registration/start`, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: email,
      first_name: firstName
    })
  });
};
