<script>
  import axios from 'axios'
  import Back from './Back.svelte'
  import { Group, Button, Dropdown, Column, Row } from '../svelte-aui/src/index.js';

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
  function calibrate() {
    axios.get('/system/calibrate').then( res => {
      console.log('[System] 📠  calibrate');

    }).catch(err => {
      console.log('[System] 📠❌  calibrate', err);

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
<div class="grid">
  <Button a={{stretch: true}}  on:click={shutdown}>Shutdown</Button>
  <Button a={{stretch: true}}  on:click={reboot}>Reboot</Button>
  <!-- <Button a={{stretch: true}}  ><a rel="prefetch" href="/hostname">Hostname</a></Button> -->
  <Button a={{stretch: true}}  on:click={update}>Update System</Button>
  <Button a={{stretch: true}}  on:click={calibrate}>Calibrate Screen</Button>
</div>