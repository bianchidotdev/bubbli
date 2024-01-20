import { BASE_API_URI } from '$lib/constants';
import { base64EncodeArrayBuffer } from './crypto';
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
  const protectedPost = await protectPost(timeline, content)
  const serializedProtectedPost = {
    protected_content: base64EncodeArrayBuffer(protectedPost.protected_content),
    encryption_algorithm: serializeEncryptionAlgorithm(protectedPost.algorithm),
  }

  const res = await fetch(`${BASE_API_URI}/timelines/${timeline.id}/posts`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(serializedProtectedPost)
  });
  if (res.status === 200) {
    const postData = await res.json()

    return postData
  }
}

function serializeEncryptionAlgorithm(algorithm: any) {
  // returns the object as is, but base64 encodes the iv if present
  if (algorithm.iv) {
    return {
      ...algorithm,
      iv: base64EncodeArrayBuffer(algorithm.iv)
    }
  }
  return algorithm
}
