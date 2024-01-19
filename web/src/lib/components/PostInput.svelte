<script lang="ts">
  import { AutoResizeTextarea } from "svelte-autoresize-textarea";
  import { createPost, type Timeline } from "$lib/timelines";

  // inputs
  export let timeline: Timeline;
  export let content = "";

  const onSubmit = async (event: Event) => {
    await createPost(timeline, content);
  }
</script>

<div class="container">
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
      required
    />

    <div class="text-right">
      <button class="btn variant-filled">Submit</button>
    </div>
  </label>
</form>
</div>
