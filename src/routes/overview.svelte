<script context="module">
  import { AutoPreload } from 'svelte-touch-os/src/index.js'
  export async function preload( page, session ) {  return AutoPreload(page, session, this) }
</script>

<script>
  import { info } from './stores.js'
  import { Button } from 'svelte-aui/src/index.js'
  import { Back } from 'svelte-touch-os/src/index.js'
  export let data;
  
</script>

<Back />
OVERVIEW!