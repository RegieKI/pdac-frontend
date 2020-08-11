<script>

  import { Any } from '../svelte-aui/src/index.js'
  export let page = {};
  
  $: back = ( () => {
    if ( !page.params ) return '/';
    if ( !page.params.slug ) return '/';
    return '/' + page.params.slug.slice(0,page.params.slug.length-1).join('/')
  });
  
</script>


<Any><a href={back()}>Back</a></Any>