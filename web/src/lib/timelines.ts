import { BASE_API_URI } from '$lib/constants';
import { protectPost } from './post';

export type Timeline = {
  id: string
  name: string
  encryption_key: CryptoKey
}

export const fetchHome = async () => {
  const res = await fetch(`${BASE_API_URI}/timelines/home`, {
    credentials: 'include'
  });
  if (res.status === 200) {
    const postsData = await res.json()

    return postsData
  }
}

export const createPost = async (timeline_id: string, content: string) => {
  const protected_post = await protectPost(timeline_id, content)

  const res = await fetch(`${BASE_API_URI}/timeline/${timeline_id}/posts`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ protected_post })
  });
  if (res.status === 200) {
    const postData = await res.json()

    return postData
  }
}