<script>

  import Back from './Back.svelte'
  import WebCam from './../helpers/WebCam.svelte'
  import { Any } from 'svelte-aui/src/index.js'
  export let page = {};
  export let data = null;
  
</script>


<Back {page} />
<WebCam />