<script context="module">
  import { AutoPreload } from 'svelte-touch-os/src/index.js'
  export async function preload( page, session ) {  return AutoPreload(page, session, this) }
</script>

<script>
  import axios from 'axios'
  import { Back, Keyboard } from 'svelte-touch-os/src/index.js'
  import { Any, Group, Button, Dropdown, Column } from 'svelte-aui/src/index.js';

  import { info, overlay } from './../stores.js'
  export let data;

  let dropdown = {options: data, key: 'hostname'};
  let hostname;

  $: hostname = data.hostname;

  function onChanged(e) {
    hostname = dropdown.options[dropdown.value].hostname;
  }
  function saveHostname( e ) {
    overlay.set( { type: 'wait', message: 'Setting hostname to ' + e.detail } )
    axios.post( `/system/hostname?as=json`, { hostname: e.detail }).then( (res)=> {
    }).catch (err => {
      overlay.set( {type: 'error', ...err.response.data} )
    });
  }

</script>
<Back />
<Column className="mlr06 keyboard-wrapper" a={{grow: true}}>
  <Keyboard placeholder="Enter a hostname" text={hostname} on:submit={saveHostname} />
</Column>
