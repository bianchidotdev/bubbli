<script lang="ts">
  // The ordering of these imports is critical to your app working properly
  import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
  // If you have source.organizeImports set to true in VSCode, then it will auto change this ordering
  import '@skeletonlabs/skeleton/styles/skeleton.css';
  // Most of your app wide CSS should be put in this file
  import '../app.postcss';
  import { AppShell, AppBar, LightSwitch, Toast } from '@skeletonlabs/skeleton';
  import Navigation from '$lib/components/Navigation.svelte';
  import NavAvatar from '$lib/components/NavAvatar.svelte';
  import { userStore } from '$lib/stores/user_store';

  // floating-ui popup setup
  import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
  import { storePopup } from '@skeletonlabs/skeleton';
  storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

  import { Drawer, drawerStore } from '@skeletonlabs/skeleton';
  function drawerOpen(): void {
    drawerStore.open({});
  }

  let authed = !!$userStore.authenticated;
  userStore.subscribe((user) => {
    authed = !!user.authenticated;
  });
</script>

<Drawer>
  <h2 class="p-4">Navigation</h2>
  <hr />
  <Navigation />
</Drawer>

<Toast />

<AppShell>
  <!-- (Header slot w/ App Bar) -->
  <AppBar>
    <svelte:fragment slot="lead">
      <div class="flex items-center">
        <button class="lg:hidden btn btn-sm mr-4" on:click={drawerOpen}>
          <span>
            <svg viewBox="0 0 100 80" class="fill-token w-4 h-4">
              <rect width="100" height="20" />
              <rect y="30" width="100" height="20" />
              <rect y="60" width="100" height="20" />
            </svg>
          </span>
        </button>
        <a href="/">
          <strong class="text-xl uppercase">Bubbli</strong>
        </a>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="trail">
      {#if authed}
        <NavAvatar user={$userStore} />
      {:else}
        <a class="btn btn-sm variant-ghost-surface" href="/login"> Login </a>
        <a class="btn btn-sm variant-ghost-surface" href="/register"> Register </a>
      {/if}
      <LightSwitch />
    </svelte:fragment>
  </AppBar>

  <!-- (Default Page Content slot) -->
  <slot />
</AppShell>
