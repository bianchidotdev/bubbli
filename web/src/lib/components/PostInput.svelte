<script lang="ts">
  import { AutoResizeTextarea } from "svelte-autoresize-textarea";
  // import { createPost } from "$lib/timelines";

  export let timeline;
  let content = "";

  function onSubmit(event: Event) {
    const formData = new FormData(event.currentTarget as HTMLFormElement);

    const content = formData.get("content");
    createPost(timeline, content);
  }
</script>

<form class="w-full card p-4 text-token space-y-4" on:submit|preventDefault={onSubmit}>
  <label class="label">
    <span>Post an update</span>
    <AutoResizeTextarea
      class="textarea"
      maxRows=10
      minRows=3
      maxlength="1000"
      placeholder="Lorem ipsum dolor sit amet consectetur adipisicing elit."
      name="content"
      bind:value={content}
    />

    <div class="text-right">
      <button class="btn variant-filled">Submit</button>
    </div>
  </label>
</form>
