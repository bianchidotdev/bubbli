<script lang="ts">
  export let author;
  export let createdAt;
  export let editedAt;
  export let content;
  export let attachments;
</script>

<div class="flex flex-row justify-center items-center mb-4">
</div>

<div class="card p-4">
  {author} posted a message.
  
  <hr class="!border-t-2 mt-2 mb-6" />
  <p>Content: {content}</p>
</div>