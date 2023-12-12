<script>
  import { get } from 'svelte/store';
  import { userStore } from '$lib/stores/user_store';
  import { onMount } from 'svelte';

  import Post from '$lib/components/Post.svelte';

  import { fetchHome } from "$lib/timelines"

  const user = get(userStore);
  export let data;
  const encryptionKey = data.encryptionKey
  const privateKey = data.privateKey

  let posts = []
  onMount(async () => {
    try {
      posts = await fetchHome();
    } catch {
      console.error('Error fetching posts');
    }
	});
</script>

<p>Hello {JSON.stringify(user)}</p>

<Post author=author content=content />

<p>
  Private Key: {privateKey && privateKey.type} - {privateKey &&
    privateKey.algorithm &&
    privateKey.algorithm.name}
</p>
<p>
  Encryption Key: {encryptionKey && encryptionKey.type} - {encryptionKey &&
    encryptionKey.algorithm &&
    encryptionKey.algorithm.name}
</p>
