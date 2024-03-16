<script lang="ts">
  import { decryptPost } from "$lib/post";

  export let post: any;
  // export let createdAt;
  // export let editedAt;
  // export let content;
  // export let attachments;
  let authorName: string;
  let protectedContent;
  let content: string;

  $: {
    console.log(JSON.stringify(post))
    authorName = post?.author?.display_name;
    protectedContent = post?.protected_content;
    (async () => {
      content = await decryptPost(post);
    })();
  }
</script>

<div class="flex flex-row justify-center items-center mb-4" />

<div class="card p-4">
  {authorName} posted a message.

  <hr class="!border-t-2 mt-2 mb-6" />
  <p>Content: {content}</p>
  <p>Post raw: {post}</p>
</div>
