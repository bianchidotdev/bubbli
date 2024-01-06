import { decryptMessage, encryptMessage, generateEncryptionIV, type ProtectedContent } from './crypto'
import { getKey } from './stores/encryption_key_store'
import type { Timeline } from './timelines'

export type Post = {
  id: string
  encrypted_content: Uint8Array
  iv: Uint8Array
  content: string
  created_at: Date
  updated_at: Date
  timeline_id: string
}

export const protectPost = async (timeline_id: string, content: string): Promise<ProtectedContent> => {
  const iv = generateEncryptionIV()
  const timelineEncryptionKey = await getKey(timeline_id)
  if (!timelineEncryptionKey) {
    throw new Error('Timeline encryption key not found')
  }
  const protectedContent = await encryptMessage(timelineEncryptionKey, content, iv)

  return {
    protected_content: protectedContent,
    iv: iv
  }
}

export const decryptPost = async (post: Post) => {
  const timelineEncryptionKey = await getKey(post.timeline_id)
  if (!timelineEncryptionKey) {
    throw new Error('Timeline encryption key not found')
  }
  return await decryptMessage(timelineEncryptionKey, post.encrypted_content, post.iv)
}