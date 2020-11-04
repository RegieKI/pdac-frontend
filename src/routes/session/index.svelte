<script context="module">
  import { AutoPreload } from 'svelte-touch-os/src/index.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>

<script>


  import { info } from '../stores.js'
  import { Back } from 'svelte-touch-os/src/index.js'
  import { Any } from 'svelte-aui/src/index.js'
  export let data;
    

  $: dev = process.env.NODE_ENV === 'development';
</script>


<Back />
{#each data as d}
  {#if d.status == 'published' || $info.showDrafts }
    <a class="grow flex align-center plr06 ptb08" href={`/session/${d.url}`}>{d.title}</a>
  {/if}
{/each}