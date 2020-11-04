<script context="module">
  import { AutoPreload } from 'svelte-touch-os/src/index.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>

<script>
  import axios from 'axios'
  import { Back } from 'svelte-touch-os/src/index.js'
  import { Group, Button, Dropdown, Column, Row } from 'svelte-aui/src/index.js';

  import { info } from '../stores.js'
  import { getContext } from 'svelte';
  const page = getContext('page');
  const data = getContext('data');

  function update() {
    axios.post('/system/update?as=json').then( res => {
      console.log('[System] 📠  update');

    }).catch(err => {
      console.log('[System] 📠❌  update', err);

    });
  }
  function calibrate() {
    axios.post('/system/calibrate?as=json').then( res => {
      console.log('[System] 📠  calibrate');

    }).catch(err => {
      console.log('[System] 📠❌  calibrate', err);

    });

  }
  function reboot() {
    axios.post('/system/reboot?as=json').then( res => {
      console.log('[System] 📠  reboot');

    }).catch(err => {
      console.log('[System] 📠❌  reboot', err);

    });

  }
  function shutdown() {
    axios.post('/system/shutdown?as=json').then( res => {
      console.log('[System] 📠  shutdown');

    }).catch(err => {
      console.log('[System] 📠❌  shutdown', err);

    });

  }

</script>

<Back {page} />
<div class="plr06">
  <div class="grid mt3">
    <Button a={{height: '80px'}} on:click={shutdown}>Shutdown</Button>
    <Button a={{height: '80px'}} on:click={reboot}>Reboot</Button>
    <Button a={{height: '80px'}} ><a rel="prefetch" href="/system/miband">MiBand</a></Button>
    <Button a={{height: '80px'}} on:click={calibrate}>Calibrate Screen</Button>
  </div>
  <div class="mtb2">Admin Only!</div>
  <Row className="mb1" a={{grow: true}}>
    <Button a={{height: '80px', grow: true}} ><a rel="prefetch" href="/system/hostname">Hostname</a></Button>
    <Button a={{height: '80px', grow: true}} ><a rel="prefetch" href="/camera">Test Camera</a></Button>
  </Row>
</div>