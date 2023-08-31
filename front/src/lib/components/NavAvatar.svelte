<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton';
  import { popup } from '@skeletonlabs/skeleton';
  import type { PopupSettings } from '@skeletonlabs/skeleton';

  import type { User } from '$app/stores/user';
  import { logOutUser } from '$lib/user';

  const avatarFeatured: PopupSettings = {
    event: 'click',
    target: 'avatarFeatured'
  };

  const onLogOutEvent = () => {
    logOutUser();
  };

  export let user: User;
</script>

<div use:popup={avatarFeatured}>
  <Avatar
    initials="??"
    rounded="rounded-3xl"
    width="w-12"
    border="border-4 border-surface-300-600-token hover:!border-primary-500"
    cursor="cursor-pointer"
  />

  <div class="card p-4 w-72 shadow-xl" data-popup="avatarFeatured">
    <ul class="list-nav">
      <li><span class="flex-auto">{user.email}</span></li>
      <hr />
      <li>
        <a href="/account">
          <span class="flex-auto">Settings</span>
        </a>
      </li>
      <!-- <li><a on:click={onLogOutEvent}>Log Out</a></li> -->
      <li>
        <button type="button" class="btn variant-filled" on:click={onLogOutEvent}>Log Out</button>
      </li>
    </ul>
  </div>
</div>
