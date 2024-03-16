import { toByteArray } from 'base64-js'
import { decryptMessage, encryptMessage, generateEncryptionIV, type ProtectedContent } from './crypto'
import { getEncryptionKey } from './stores/encryption_key_store'
import type { Timeline } from './timelines'

export type Post = {
  id: string
  protected_content: string // base64 encoded
  encryption_algorithm: any // base64 encoded TODO: how to handle
  author: any
  content: string
  created_at: Date
  updated_at: Date
  timeline_id: string
  encryption_context_id: string
}

export const protectPost = async (timeline: Timeline, content: string): Promise<ProtectedContent> => {
  const timelineEncryptionKey = await getEncryptionKey(timeline.encryption_context_id)
  if (!timelineEncryptionKey) {
    throw new Error(`Timeline encryption key not found for '${timeline.encryption_context_id}'`)
  }
  const { encryptedMessage: protectedContent, algorithm } = await encryptMessage(timelineEncryptionKey, content)

  return {
    protected_content: protectedContent,
    algorithm: algorithm
  }
}

export const decryptPost = async (post: Post) => {
  const timelineEncryptionKey = await getEncryptionKey(post.encryption_context_id)
  if (!timelineEncryptionKey) {
    throw new Error(`Timeline encryption key not found for '${post.encryption_context_id}'`)
  }
  // TODO: make this more maintainable
  const rawContent = toByteArray(post.protected_content)
  const {iv, name} = post.encryption_algorithm
  const alg = {iv: toByteArray(iv), name}
  const messageContent = await decryptMessage(timelineEncryptionKey, rawContent, alg)
  return new TextDecoder("utf-8").decode(messageContent)
}