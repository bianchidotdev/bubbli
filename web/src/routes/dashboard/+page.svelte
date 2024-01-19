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

  // sketchy af
  const timeline = {...user?.home_timeline, ...{encryption_context_id: "home"}}
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

<PostInput timeline={timeline}/>

<Post author={author} content={content} />
