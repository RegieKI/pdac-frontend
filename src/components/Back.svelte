<script>

  import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";
  export let history = false;

  $: path = ( typeof window !== 'undefined' ) ? window.location.pathname : "/";

  $: back = ( () => {
    const idx = path.lastIndexOf('/');
    if ( idx == -1 ) return '/';
    return path.substring( 0, idx );
  });

  function previousInHistory(e) {
    if (typeof window !== "undefined" && typeof document !== "undefined") window.history.back();
  }
  
</script>

{#if !history}
  <a id="back" class="plr06" href={back()} >
    <ArrowLeft />
    Back
  </a>
{:else}

  <a id="back" class="plr06" on:click={previousInHistory} >
    <ArrowLeft />
    Back
  </a>
{/if}