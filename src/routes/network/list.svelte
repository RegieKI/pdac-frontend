<script context="module">
  import { AutoPreload } from 'svelte-touch-os/src/index.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>

<script>

  import { onMount } from 'svelte'
  import { Button } from 'svelte-aui/src/index.js'
  import { Back } from 'svelte-touch-os/src/index.js'
  
  export let data;

  $: sorted = data;//data.sort( (a,b) => Math.abs( parseInt(a.signal_level) ) - Math.abs( parseInt(b.signal_level) ) );

  $: freq = ( (num) => {
    if (num > 5000 && num < 6000) return "5ghz";
    if (num > 2400 && num < 2500) return "2.4ghz";
    return ((num/100)*10)+"ghz";
  });
  
</script>

<Back />


{#if data.result == 'FAIL-BUSY'}
  <div class="m06">
    <div class="mb1">WLAN card reported busy, please retry:</div>
    <Button a={{height: '80px'}} on:click={ e => window.location = window.location} >Retry</Button>
  </div>

{:else}


  {#each data as n}

    {#if n.ssid}
      <div >
        <a href={`/network/connect?ssid=${n.ssid}`} class="p06 flex blco">
          {n.ssid} 
          ({ freq(n.frequency) })
        </a>
      </div>
    {/if}
  {/each}

{/if}