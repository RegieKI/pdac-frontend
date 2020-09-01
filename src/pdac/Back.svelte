<script>

  import { previousPage } from './Store.js'
  import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";
  export let page = {};
  

  $: back = ( () => {
    if ( !page.params ) return '/';
    if ( !page.params.slug ) return '/';
    return '/' + page.params.slug.slice(0,page.params.slug.length-1).join('/')
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