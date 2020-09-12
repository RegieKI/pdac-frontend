<script>

  import { onMount } from 'svelte'
  import axios from 'axios'
  import Back from './../../helpers/Back.svelte'
  import WebCam from './../../helpers/WebCam.svelte'
  import { Timestamp } from './../../helpers/Utils.js'
  import { Column, Button, Toggle, Text, Row } from 'svelte-aui/src/index.js';

  import { info, overlay } from './../stores.js'
  export let page = {};
  export let data = {};


  function fileName() {
    return $info.hostname + '_test_'+Timestamp();
  }

  let sessionId = { value: fileName() }; 

  let audioSettings = { value: true };
  let videoSettings = { value: true };
  let heartRateSettings = { value: false };

  let rtspSettings = { value: false };
  let fileSettings = { value: true };
  let windowSettings = { value: false };

  function start() {

    const config = {
      'session-id': sessionId.value, 
      sources: {
        audio: {
          active: audioSettings.value
        },
        video: {
          active: videoSettings.value
        },
        heartrate: {
          active: heartRateSettings.value
        }
      },
      sinks: {
        rstp: {
          active: rtspSettings.value
        },
        file: {
          active: fileSettings.value
        },
        window: {
          active: windowSettings.value
        }
      }
    };

    console.log('[Camera] 📸 opening camera', config)

    overlay.set( { type: 'wait', message: 'Opening camera' } )
    axios.post('/camera/start?as=json', config).then( (res) => {
      console.log('[Camera] 📸 ✅  successfully started')
      overlay.set( null )
    }).catch( err => {
      console.log(
        '[Camera] ❌ error starting:',
        err.response.data
      )
      overlay.set( {type: 'error', ...err.response.data} )
    }).finally( e => {
      info.grab();    
    })
  }

  function stop() {

    overlay.set( { type: 'wait', message: 'Closing camera' } )
    axios.post('/camera/stop?as=json', {}).then( (res) => {
      console.log('[Camera] 📸 🛑  successfully stopped')
      overlay.set( null ) 
    }).catch( err => {
      console.log('[Camera] ❌ error stopping:', err.response.data )
      overlay.set( {type: 'error', ...err.response.data} )
    }).finally( e => {
      info.grab();
      sessionId.value = fileName();
    })
  }


  onMount( async() => {

    if (process.browser && navigator.mediaDevices) { 
      navigator.mediaDevices.enumerateDevices().then(function (devices) {
        for(var i = 0; i < devices.length; i ++){
            var device = devices[i];
            if (device.kind === 'videoinput') {
              console.log('[Camera] 🎥  camera available', i, {...device});
            }
        }
      });
    }
   });

  $: isCameraOpen = $info.backend.session.running;

</script>

<Back {page} />
<!-- <Column> -->
  <Row>
    <Toggle bind:a={audioSettings}>Audio</Toggle>
    <Toggle bind:a={videoSettings}>Video</Toggle>
    <Toggle bind:a={heartRateSettings}>Heartrate</Toggle>
  </Row>
  <Row>
    <Toggle >Face</Toggle>
    <Toggle >Body</Toggle>
    <Toggle >Sockets</Toggle>
  </Row>
  <Row>
    <Toggle bind:a={rtspSettings}>RTSP</Toggle>
    <Toggle bind:a={fileSettings}>File</Toggle>
    <Toggle bind:a={windowSettings}>Window</Toggle>
  </Row>
  <Row>
    <Button><a href="/camera/preview">Preview</a></Button>
    {#if isCameraOpen} 
      <Button on:click={stop}>Stop</Button>
    {:else}
      <Button on:click={start}>Start</Button>
    {/if}
  </Row>
<!-- </Column> -->