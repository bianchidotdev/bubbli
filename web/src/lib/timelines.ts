import { BASE_API_URI } from '$lib/constants';
import { protectPost } from './post';

export type Timeline = {
  id: string
  type: string
  encryption_context_id: string
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

export const createPost = async (timeline: Timeline, content: string) => {
  const protected_post = await protectPost(timeline, content)

  const res = await fetch(`${BASE_API_URI}/timeline/${timeline.id}/posts`, {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({ protected_post })
  });
  if (res.status === 200) {
    const postData = await res.json()

    return postData
  }
}