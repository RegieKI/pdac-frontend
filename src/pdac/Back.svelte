<script>

  import { Any } from '../svelte-aui/src/index.js'
  export let page = {};
  
  $: back = ( () => {
    if ( !page.params ) return '/';
    if ( !page.params.slug ) return '/';
    return '/' + page.params.slug.slice(0,page.params.slug.length-1).join('/')
  });
  
</script>

<style lang="sass">
.back-button
	position: relative
	z-index: 9
</style>


<a class="back-button" href={back()}>Back</a>