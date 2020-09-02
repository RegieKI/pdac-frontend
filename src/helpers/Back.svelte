<script>

  import { stores } from '@sapper/app';
  const { preloading, page, session } = stores();
  import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";


  $: back = ( () => {
    const idx = $page.path.lastIndexOf('/');
    if ( idx == -1 ) return '/';
    return $page.path.substring( 0, idx );
  });

  function onClick(e) {

    if (typeof window !== "undefined" && typeof document !== "undefined") {
      window.history.back();
    }

  }
  
</script>

<a id="back" href={back()} ><!--on:click={onClick} >-->
  <ArrowLeft />
  Back
</a>