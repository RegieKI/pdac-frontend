<script context="module">
  import { AutoPreload } from './../../../helpers/Utils.js'
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

  import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";
  import TimerSand from "svelte-material-icons/TimerSand.svelte";
  import RadioboxMarked from "svelte-material-icons/RadioboxMarked.svelte";
  import Pause from "svelte-material-icons/Pause.svelte";
  import Play from "svelte-material-icons/Play.svelte";
  import Restart from "svelte-material-icons/Restart.svelte";

  // helpers...

  import { Timestamp } from './../../../helpers/Utils.js'
  import Timer from './../../../helpers/Timer.svelte'
  import WebCam from './../../../helpers/WebCam.svelte'
  import Back from './../../../helpers/Back.svelte'
  import AudioLevels from './../../../helpers/AudioLevels.svelte'
  import { Any, Button, Column, Row } from './../../../svelte-aui/src/index.js'


  export let data;
  let paused = false;
  let recording = true;//false;
  let restartTimer;

  $: session = data[0] || {};
  $: exercise = (session.exercises[exerciseIndex]) ? session.exercises[exerciseIndex].exercise_id : {} || {};
  $: tags = exercise.tags || [];

  const exerciseIndex = 0;

  $: identifier = `${$info.hostname}_${session.point_of_interest}_${session.url}_${exerciseIndex}_${tags.map( t => { return t.tag_id.url;  })}`;



  onMount( async() => {
 
    console.log('[session:slug:idx]', 'idx:', $page.params.idx);

  });


  let time = 50;

  $: recordingConfig = {
    'session-id': `${identifier}_${Timestamp()}`,
    sources: {
      audio: {
        active: true
      },
      video: {
        active: true
      },
      heartrate: {
        active: $info.backend.miband.connected
      }
    },
    sinks: {
      rstp: {
        active: false
      },
      file: {
        active: true
      },
      window: {
        active: false
      }
    }
  };

  function onIntroSecond( e ) {
    const t = parseInt( e.detail, 10);
    if (t <= 10 && t != 0) {
      const sequence = (t == 1) ? '50 50 11 0.001' : '100 100 1 0.001';
      console.log('Count', sequence, t);
      axios.post('/buzz?as=json', { sequence });

    }
  }

  function onIntroEnd( e ) {
    console.log('INTRO ENDED!', e.detail);
    start();
  }
  function onRecordSecond( e ) {
    console.log('RECORDING');
  }

  function onRecordEnd( e ) {
    console.log('Recording ended!', e.detail);
    // stop();
    if ( $page.params.idx >= session.exercises.length ) {
      goto( '/session/' + session.url + '/complete' );
    } else {
      goto( '/session/' + session.url + '/' + $page.params.idx );
    }
  }

  function start( e ) {

    overlay.set({
      type: 'wait',
      message: "Opening Camera<br />Please wait..."
    })
    axios.post('/camera/start?as=json', recordingConfig).then( res => {

      console.log('[session:slug:idx] 📸  begun recording ✅');
      recording = true;
      overlay.set( null );
    }).catch( err => {
      console.log('[session:slug:idx] could not start 📸 ❌', err.toString(), Object.keys(err), err.response);
      overlay.set({
        type: 'error',
        ...err.response.data
      })
    })
  }

  function stop( e ) {

    overlay.set({
      type: 'wait',
      message: "Closing Camera"
    })
    axios.post('/camera/stop?as=json', {}).then( res => {

      console.log('[session:slug:idx] 📸🛑  stopped recording');
      const sequence = '10 40 41 0.0001';
      overlay.set({
        type: 'wait',
        message: "Successfully Closed"
      })
      axios.post('/buzz?as=json', { sequence }).finally( () => {

        setTimeout( () => {
          recording = false;
          overlay.set( null );
        },2000)
      });
    }).catch( err => {
      console.log('[session:slug:idx] could not stop 📸 ❌', err.toString(), Object.keys(err), err.response);
      overlay.set({
        type: 'error',
        ...err.response.data
      })
    })
  }

</script>

<Row a={{justify: "center"}}>
  {#if recording} 
    <Timer className="pulse" on:second={onRecordSecond} on:end={onRecordEnd} time={11} />
  {:else}
    <Timer className="spin" bind:restart={restartTimer} on:second={onIntroSecond} on:end={onIntroEnd} time={time+1} paused={paused} />
  {/if}
</Row>
<Row a={{justify: "center"}}>
  <div style="margin: 0.5em 0em">
    {exerciseIndex}/{session.exercises.length}: {exercise.description} <br />
    Tags:
    {#each exercise.tags as tag}
      <span>{tag.tag_id.title}&nbsp;</span>  
    {/each}
  </div>
</Row>


{#if recording} 
  <Row><Button on:click={ stop }>Panic!</Button></Row>
{:else}
  <Row> 
    <Button>
      <a href="/session/{session.url}"><ArrowLeft /></a>
    </Button>
    <Button on:click={ () => paused = !paused }>
      {#if paused}
        <span><Play /></span>
      {:else}
        <span><Pause /></span>
      {/if}
    </Button>
    <Button on:click={ () =>  restartTimer( time+1 ) } >
      <span><Restart /></span>
    </Button>
    <Button on:click={ () =>  restartTimer( 2 ) } >
      Boop
    </Button>
  </Row>
{/if}



<style lang="sass">
  .bar
    width: 100%
    height: 5px
    position: relative
    margin-top: 10px
    border-radius: 5px
    &.status-0 .inner
      background: lightgreen
    &.status-1 .inner
      background: tomato
    .inner
      position: absolute
      top: 0
      left: 0
      height: 100%
      background: white
      max-width: 100%
  .circle
    $size: 30px
    width: $size
    height: $size
    border-radius: $size
    position: absolute
    top: 40px
    right: 40px
    background: tomato
    min-height: 0px!important
    z-index: 0
    opacity: 0
    &.active
      opacity: 1

  /*.recording-session*/
</style>

<!-- 

  function speak( text, speed ) {

    let speak = new SpeechSynthesisUtterance(text);
    speak.lang = 'de-DE';
    speak.pitch = 0;
    speak.rate = speed;
    let voices = window.speechSynthesis.getVoices();
    speak.voice = voices[3];
    window.speechSynthesis.speak(speak);
  }
 -->