<script context="module">
  import { AutoPreload } from 'svelte-touch-os/src/index.js'
  export async function preload( page, session ) {  return AutoPreload(page, session, this) }
</script>

<script>
  import axios from 'axios'
  import { Back } from 'svelte-touch-os/src/index.js'
  import { Any, Group, Button, Dropdown, Column } from 'svelte-aui/src/index.js';

  import { info, overlay } from './../stores.js'
  export let data;

  let dropdown = {options: data, key: 'hostname'};
  let hostname;

  $: hostname = (dropdown.value !== undefined) ? dropdown.options[dropdown.value] : undefined;

  function onChanged(e) {
    hostname = dropdown.options[dropdown.value].hostname;
  }
  function saveHostname( e ) {
    if (hostname != undefined) {
      axios.post( `/system/hostname?as=json`, { hostname }).then( (res)=> {
      }).catch (err => {
        overlay.set( {type: 'error', ...err.response.data} )
      });
    }
  }

</script>

<Back />
<div>Current hostname: { ($info) ? $info.hostname : 'LOADING'} </div>
<Dropdown bind:a={dropdown} on:change={onChanged} />
<Button on:click={saveHostname}>Change Hostname</Button>