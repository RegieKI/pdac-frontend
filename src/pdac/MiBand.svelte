<script>

  import MiBands from './MiBands.js'
  import axios from 'axios'
  import Back from './Back.svelte'
  import { Any, Group, Button, Dropdown, Column } from '../svelte-aui/src/index.js';

  import { info, overlay } from './Store.js'
  export let page = {};
  export let data = {};

  let dropdown = {options: MiBands, key: 'number'};
  function strip(str) {
    return str.replace(/(\r\n|\n|\r)/gm, "").trim()
  }
  $: miband = ($info) ?  MiBands.find( c => strip(c.mac_address) === strip($info.backend.mac_address) ) : undefined;

  function setMiBand() {
    let mb = MiBands[dropdown.value];
    console.log(mb);

    if (mb) {

      axios.post( `/miband/update?as=json`, { mac_address: mb.mac_address }).then( (res)=> {
        console.log('[Miband] ⌚️✅  Miband updated...', mb.mac_address, mb.number);
        info.grab(); 
      }).catch (err => {

        console.log('[Miband] ⌚️❌ could not update ', err.toString(), Object.keys(err), err.response);
        overlay.set( {type: 'error', ...err.response.data} )
      });
    }
  }

  function reconnectHR() {

    console.log('[Session] ⌚️  Miband reconnecting...');
    overlay.set( { type: 'wait', message: 'Reconnecting to ' + miband.mac_address } )

    axios.post('/miband/reconnect?as=json', {}).then( res => {

        console.log('[Session] ⌚️✅  Miband connected');
        overlay.set(null);
    }).catch( err => {

        console.log('[Session] ⌚️❌ Miband could not reconnect ', err.toString(), Object.keys(err), err.response);
        overlay.set({
          type: 'error',
          ...err.response.data
        })
    })
  }

  function onChanged() {

  }

</script>

<Back {page} />
<div>Current MiBand: { miband ? miband.number : "NONE" } ( { miband ? miband.mac_address : "~" } ) </div>
<div>
  Status: 
  { $info.backend.miband.initialised ? "Initialised" : "Not Initialised" }
  { $info.backend.miband.connected ? "Connected" : "Not Connected" }
</div>
<Dropdown bind:a={dropdown} on:change={onChanged} />
<Button on:click={setMiBand}>Change MiBand</Button>
<Button on:click={reconnectHR}>Reconnect MiBand</Button>