<script context="module">
  import { AutoPreload } from 'svelte-touch-os/src/index.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>
<script>

  import axios from 'axios'
  import { onMount } from 'svelte'
  import { goto } from '@sapper/app';

  // stores...

  import { info, overlay } from './../../stores.js'
  import { stores } from '@sapper/app';
  const { page } = stores();

  // icons ...

  import TimerSand from "svelte-material-icons/TimerSand.svelte";
  import RadioboxMarked from "svelte-material-icons/RadioboxMarked.svelte";

  // helpers...

  import { Timestamp, Back, WebCam, AudioLevels }  from 'svelte-touch-os/src/index.js'
  import { Any, Button, Column, Row, Block } from 'svelte-aui/src/index.js'


  export let data;

  $: session = data[0];

  $: totalTime = (() => {
    let t = 0;
    session.exercises.forEach( e => {
      const ex = e.exercise_id;
      if (ex.time) t += ex.time;
    })
    return t;
  });



  let useHeartrate = true;
  $: isHRConnected = ($info) ? ($info.backend) ? $info.backend.miband.connected : false : false;

  onMount( async() => {
    console.log('[Session mount] 👥🌀')

    axios.get('http://localhost:8888/status').then( res => {
      console.log('[Session mount] 👥✅', res)

    }).catch( err => {
      console.log('[Session mount] 👥❌')
    })
  });

  function reconnectHR() {

    console.log('[Session] ⌚️  Miband reconnecting...');
    overlay.set( { type: 'wait', message: 'Reconnecting to ' + $info.backend.mac_address + '<br />Waiting for sync...' } )

    axios.post('/system/miband/reconnect?as=json', {}).then( res => {

        console.log('[Session] ⌚️✅  Miband connected', res);
        info.grab();
        overlay.set( { type: 'success', message: 'Successfully Reconnected', close: 'OK'});
    }).catch( err => {

        console.log('[Session] ⌚️❌ Miband could not reconnect ', err.toString(), Object.keys(err), err.response);
        let o = {
          type: 'error',
          ...err.response.data
        };

        o.message = "MiBand Response:<br />"+o.message;
        overlay.set(o)
    })
  }

</script>


  <!-- introduction -->

  <Back />

<!--   {#if useHeartrate && !isHRConnected}
    <div style="margin: 0.5em 0em">MiBand is not connected<br />Address: {$info.backend.mac_address}</div>
    <Button on:click={reconnectHR}>Reconnect</Button>
    <Button on:click={ e => { useHeartrate = false } } >Skip</Button>
  {:else} -->
  <Block className="p06">
    <Block className="pb06">
      {session.title}: <br />
      {session.exercises.length} exercise(s), 
      {totalTime()} seconds in total
    </Block>
    <Block className="pb06">
      {@html session.description
    }</Block>
    <Button a={{height: '80px'}}>
      <a href={$page.path + '/preview'}>Start Session</a>
    </Button>
  </Block>
<!--   {/if} -->

