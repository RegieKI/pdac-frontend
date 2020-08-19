<script>
  import axios from 'axios'
  import Back from './Back.svelte'
  import { Group, Button, Dropdown, Column } from '../svelte-aui/src/index.js';

  import { info } from './Store.js'
  export let page = {};
  export let data = {};

  function update() {
    axios.get('/system/update').then( res => {
      console.log('[System] 📠  update');

    }).catch(err => {
      console.log('[System] 📠❌  update', err);

    });
  }
  function restart() {
    axios.get('/system/restart').then( res => {
      console.log('[System] 📠  restart');

    }).catch(err => {
      console.log('[System] 📠❌  restart', err);

    });

  }
  function reboot() {
    axios.get('/system/reboot').then( res => {
      console.log('[System] 📠  reboot');

    }).catch(err => {
      console.log('[System] 📠❌  reboot', err);

    });

  }
  function shutdown() {
    axios.get('/system/shutdown').then( res => {
      console.log('[System] 📠  shutdown');

    }).catch(err => {
      console.log('[System] 📠❌  shutdown', err);

    });

  }

</script>

<Back {page} />
<Button on:click={update}>Update</Button>
<Button on:click={restart}>Restart</Button>
<Button on:click={shutdown}>Shutdown</Button>
<Button on:click={reboot}>Reboot</Button>