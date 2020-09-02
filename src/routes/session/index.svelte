<script context="module">
  import { AutoPreload } from './../../helpers/Utils.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>

<script>

  import Back from './../../helpers/Back.svelte'
  import { Any } from '../../svelte-aui/src/index.js'
  export let data;
  
</script>


<Back />
{#each data as d}
<Any><a href={`/session/${d.url}`}>{d.title}</a></Any>
{/each}