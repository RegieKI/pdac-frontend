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

  function toggleDrafts() {
    info.toggleDrafts();
  }

  function updateSystem() {

    console.log('[System] 📠  updating system...');
    axios.post('/system/update?as=json').then( res => {
      console.log('[System] 📠  updating');

    }).catch(err => {
      console.log('[System] 📠❌  updating', err);

    });
  }

</script>

<Back {page} />
<Column className="mlr06">
  <Row className="mb04" a={{grow: true}}>
    <Button a={{height: '60px', grow: true}} on:click={shutdown}>Shutdown</Button>
    <Button a={{height: '60px', grow: true}} on:click={reboot}>Reboot</Button>
  </Row>
  <Row className="mb04" a={{grow: true}}>
    <Button a={{height: '60px', grow: true}} on:click={calibrate}>Calibrate Screen</Button>
    <Button a={{height: '60px', grow: true}} on:click={updateSystem}>Update System</Button>
  </Row>
  <Row className="mb04" a={{grow: true}}>
    <Button a={{height: '60px', grow: true}}><a rel="prefetch" href="/network">WLAN / Wifi</a></Button>
    <Button a={{height: '60px', grow: true}}><a rel="prefetch" href="/system/dhcp">DHCP Edit</a></Button>
  </Row>
  <div class="mtb2">Admin Only!</div>
  <Row className="mb04" a={{grow: true}}>
    <Button a={{height: '60px', grow: true}} ><a rel="prefetch" href="/system/hostname">Hostname</a></Button>
    <Button a={{height: '60px', grow: true}} ><a rel="prefetch" href="/camera">Test Camera</a></Button>
  </Row>
  <Row className="mb04 pb1" a={{grow: true}}>
    <Button a={{height: '60px', grow: true}} ><a rel="prefetch" href="/system/miband">MiBand</a></Button>
    <Button a={{height: '60px', grow: true}} on:click={toggleDrafts} >
      {($info.showDrafts) ? 'Hide' : 'Show'}
      Drafts
    </Button>
  </Row>
</Column>