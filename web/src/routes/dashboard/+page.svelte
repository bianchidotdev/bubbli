<script>
  import { get } from 'svelte/store';
  import { userStore } from '$lib/stores/user_store';
  import { onMount } from 'svelte';

  import Post from '$lib/components/Post.svelte';
  import PostInput from '$lib/components/PostInput.svelte';

  import { fetchHome } from "$lib/timelines"

  const user = get(userStore);
  // export let data;
  // const encryptionKey = data.encryptionKey
  // const privateKey = data.privateKey

  const timeline = user?.home_timeline
  const author = user
  const content = "Hello world!"

  let posts = []
  onMount(async () => {
    try {
      const homeData = await fetchHome();
      if (homeData) {
        posts = homeData.posts
      }
    } catch {
      console.error('Error fetching posts');
    }
	});
</script>

<PostInput timeline={timeline}/>

{#each posts as post}
  <Post post={post} />
{/each}

