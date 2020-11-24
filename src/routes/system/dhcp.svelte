<script context="module">
  import { AutoPreload } from 'svelte-touch-os/src/index.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>

<script>

  import axios from 'axios'
  import { stores } from '@sapper/app';
  const { page } = stores();
  import { goto } from '@sapper/app'
  import { onMount } from 'svelte'
  import { info, overlay } from './../stores.js'
  import { Back, Keyboard } from 'svelte-touch-os/src/index.js'
  import { Any, Boolean, Button, Group, Text, Column, Defines as d } from 'svelte-aui/src/index.js'

  export let data;

  const start = '\n\n# ---------- auto-generated from pdac -------- >>>>'
  const end =   '# <<<<< ---- auto-generated from pdac -------------\n\n'


  $: txt = data.txt
  $: config = data.config
  $: inject = start + '\n' + txt + '\n' + end
  $: exists = config.indexOf( inject ) != -1

  onMount( async() => {
    console.log(data, data);
  });


  function onClick( e ) {
      overlay.set( { type: 'wait', message: 'Restarting DHCP service' } )
      const blob = ( exists ) ? config.replace( inject, '' ) : config + inject
      axios.post( `/system/dhcp?as=json`, { blob }).then( (res)=> {
        console.log('[dhcp.svelte] restarted:', res)
        overlay.set( {type: 'success', message: 'DHCP Restarted'} )
      }).catch (err => {
        overlay.set( {type: 'error', ...err.response.data} )
      });
  }

  
</script>

<Back />
{#if txt}
  <div class="plr06">Found USB dhcp.txt:</div>
  <div class="terminal plr1 ptb04 " style="white-space: pre">{txt}</div>
  <div class="grow flex plr06 pb06">
    <Button a={{grow: true}} on:click={onClick} >{ (exists) ? 'Disable DHCP Edit' : 'Enable DHCP Edit' } </Button>
  </div>
{:else}
  <div>No USB dhcp.txt found.</div>
{/if}