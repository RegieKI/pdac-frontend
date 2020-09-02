<script>

  import { stores } from '@sapper/app';
  const { preloading, page, session } = stores();
  import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";
  export let useHistory = false;

  $: back = ( () => {
    const idx = $page.path.lastIndexOf('/');
    if ( idx == -1 ) return '/';
    return $page.path.substring( 0, idx );
  });

  function previousInHistory(e) {
    if (typeof window !== "undefined" && typeof document !== "undefined") window.history.back();
  }
  
</script>

{#if !useHistory}
  <a id="back" href={back()} >
    <ArrowLeft />
    Back
  </a>
{:else}

  <a id="back" on:click={previousInHistory} >
    <ArrowLeft />
    Back
  </a>
{/if}