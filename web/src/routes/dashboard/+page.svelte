<script>
  import { get } from 'svelte/store';
  import { userStore } from '$lib/stores/user_store';
  import { onMount } from 'svelte';

  import Post from '$lib/components/Post.svelte';
  import PostInput from '$lib/components/PostInput.svelte';

  import { fetchHome } from "$lib/timelines"

  const user = get(userStore);
  export let data;
  const encryptionKey = data.encryptionKey
  const privateKey = data.privateKey
  const timeline_id = user?.home_timeline_id
  // TODO: get this from the server
  const author = user
  const content = "Hello world!"

  let posts = []
  onMount(async () => {
    try {
      posts = await fetchHome();
    } catch {
      console.error('Error fetching posts');
    }
	});
</script>

<PostInput timeline_id={timeline_id}/>

<Post author={author} content={content} />
