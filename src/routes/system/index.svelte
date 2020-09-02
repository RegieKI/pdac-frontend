<script context="module">
  import { AutoPreload } from './../../helpers/Utils.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>

<script>
  import axios from 'axios'
  import Back from './../../helpers/Back.svelte'
  import { Group, Button, Dropdown, Column, Row } from '../../svelte-aui/src/index.js';

  import { info } from '../stores.js'
  import { getContext } from 'svelte';
  const page = getContext('page');
  const data = getContext('data');

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
  <Button a={{stretch: true}}  ><a rel="prefetch" href="/system/miband">MiBand</a></Button>
  <Button a={{stretch: true}}  ><a rel="prefetch" href="/system/hostname">Hostname</a></Button>
  <Button a={{stretch: true}}  ><a rel="prefetch" href="/network">WLAN</a></Button>
  <Button a={{stretch: true}}  on:click={calibrate}>Calibrate Screen</Button>
</div>