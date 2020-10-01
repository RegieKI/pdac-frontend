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

  import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";
  import TimerSand from "svelte-material-icons/TimerSand.svelte";
  import RadioboxMarked from "svelte-material-icons/RadioboxMarked.svelte";
  import Pause from "svelte-material-icons/Pause.svelte";
  import Play from "svelte-material-icons/Play.svelte";
  import Refresh from "svelte-material-icons/Refresh.svelte";

  // helpers...

  import { Timestamp, Timer, WebCam, Back, AudioLevels } from 'svelte-touch-os/src/index.js'
  import { Any, Button, Column, Row, Block } from 'svelte-aui/src/index.js'


  export let data;
  let paused = false;
  let recording = false;
  let restartTimer;

  $: zeroIdx = parseInt( $page.params.idx, 10 ) - 1;
  $: humanIdx = parseInt( $page.params.idx, 10 );
  $: session = data[0] || {};
  $: exercise = (session.exercises[zeroIdx]) ? session.exercises[zeroIdx].exercise_id : { example: { data: {} }};
  $: tags = exercise.tags || [];
  $: identifier = (`${$info.hostname}_${session.point_of_interest}_${session.url}_${humanIdx}_${tags.map( t => { return t.tag_id.url;  })}`).replace(/,/g, '-');


  onMount( async() => {
 
    console.log('[session:slug:idx] 🤳 idx:', humanIdx);

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
        active: ( $info.backend.miband.connected ) ? true : false
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

  function onIntroStart(e) {
      console.log('[session:slug:idx] 🖖🏁 intro start:', e.detail);
    
  }
  function onRecordStart(e) {
      console.log('[session:slug:idx] 🔴🏁 record start:', e.detail);
    
  }

  function onIntroSecond( e ) {
    const t = parseInt( e.detail, 10);
    if (t <= 10 && t != 0) {
      const sequence = (t == 1) ? '50 50 11 0.001' : '100 100 1 0.001';
      console.log('Count', sequence, t);
      console.log('[session:slug:idx] 🖖 intro buzz:', e.detail);
      axios.post('/buzz?as=json', { sequence });

    }
  }

  function onIntroEnd( e ) {
    console.log('[session:slug:idx] 🖖 intro ended:', e.detail);
    start();
  }
  function onRecordSecond( e ) {
    console.log('[session:slug:idx] 🔴 recording:', e.detail);
  }

  function onRecordEnd( e ) {
    console.log('[session:slug:idx] 🔴✅  recording ended:', e.detail);
    stop();
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
      stop();
      // overlay.set({
      //   type: 'error',
      //   ...err.response.data
      // })
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
          const url = (zeroIdx >= session.exercises.length - 1) ? '/session/' + session.url + '/complete' : '/session/' + session.url + '/' + ( humanIdx + 1);
          console.log( '[session:slug:idx] 🛫  goto: ', url, zeroIdx, session.exercises.length)
          goto( url ); 
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

<Block className="justify-center align-center">
  {#if recording} 
    <Timer className="pulse" id="RECORD: {exercise.description}" on:start={onRecordStart} on:second={onRecordSecond} on:end={onRecordEnd} time={exercise.time} />
  {:else}
    <Timer className="spin" id="INTRO: {exercise.description}" bind:restart={restartTimer} on:start={onIntroStart} on:second={onIntroSecond} on:end={onIntroEnd} time={time+1} paused={paused} />
  {/if}
</Block>
<Row a={{justify: "center"}}>

  {#if session.point_of_interest == 'sound'}

    <audio style="margin: 0.6em 0em" src={exercise.example.data.full_url} autoplay controls />
  {:else}
    <div style="margin: 0.5em 0em">
      {humanIdx}/{session.exercises.length}: {exercise.description} <br />
      Tags:
      {#each exercise.tags as tag}
        <span>{tag.tag_id.title}&nbsp;</span>  
      {/each}
    </div>
  {/if}
</Row>


{#if recording} 
  <Row><Button on:click={ stop }>Panic!</Button></Row>
{:else}
  <a style="position: absolute; top: 50px; left: 10px;flex-direction: row;align-items: center;" href="/session/{session.url}"><ArrowLeft /> Back</a>
  <Row> 
    <Button on:click={ () =>  restartTimer( time+1 ) } >
      <span><Refresh /></span>
    </Button>
    <Button on:click={ () => paused = !paused }>
      {#if paused}
        <span><Play /></span>
      {:else}
        <span><Pause /></span>
      {/if}
    </Button>
    <Button on:click={ () =>  restartTimer( 11 ) } >
      10s
    </Button>
  </Row>
{/if}


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