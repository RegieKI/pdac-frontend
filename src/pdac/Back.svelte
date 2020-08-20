<script>

  import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";
  import { Any } from '../svelte-aui/src/index.js'
  export let page = {};
  
  $: back = ( () => {
    if ( !page.params ) return '/';
    if ( !page.params.slug ) return '/';
    return '/' + page.params.slug.slice(0,page.params.slug.length-1).join('/')
  });
  
</script>

<!-- <Any> -->
  <a id="back" href={back()}>
    <ArrowLeft />
    Back
  </a>
<!-- </Any>  -->