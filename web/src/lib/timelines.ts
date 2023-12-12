import { BASE_API_URI } from '$lib/constants';

export const fetchHome = async () => {
  const res = await fetch(`${BASE_API_URI}/timelines/home`, {
    credentials: 'include'
  });
  if (res.status === 200) {
    const postsData = await res.json()

    return postsData
  }
}
