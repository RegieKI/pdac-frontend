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
  $: tags_mapped = tags.map( t => t.tag_id.url )


  $: _identifier = () => {

    let str = $info.hostname + '_';
    str += session.point_of_interest + '_';
    str += session.url + '_';
    str += humanIdx + '_';
    tags.forEach( (t, i) => {
      if (t.tag_id) {
        str += t.tag_id.url;
        if (i < tags.length - 1) str += '-';
      }
    });
    console.log('[SESSION] 🗯 🦆  returning ID:', str);
    return str;
  }
  $: identifier = _identifier();


  onMount( async() => {
 
    console.log('[session:slug:idx] 🤳 idx:', humanIdx);

  });


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
      status: '🤖',
      message: "Sending to AI..."
    })

    const tags = [ 'liebe', 'trauer', 'wut', 'freude', 'uberraschung', 'verachtung', 'angst' ]
    let sTitle = 'none'
    tags_mapped.forEach( t => {
      if ( tags.indexOf( t ) != -1 ) sTitle = t
    })

    const conf = { 
      action: 'start', 
      title: sTitle, 
      tags: tags_mapped, 
      type: '🤖', 
      length: exercise.time, 
      timestamp: new Date().toISOString().substr(11, 8),
      message: `starting exercise: "${sTitle}" ${exercise.time}s`
    }
    console.log('[idx.svelte] 🤖 ⚡️ 💅  sending config START to AI...', conf)

    if ( window.websocketsClient ) {

      window.websocketsClient.send( JSON.stringify( conf ) )
      recording = true;
      overlay.set( null );

    } else {

      overlay.set({
        type: 'error',
        status: '🤖',
        message: 'No connection to AI...'
      })

    };


    return;

    overlay.set({
      type: 'wait',
      message: "Opening Camera<br />Please wait..."
    })
    axios.post('/camera/start?as=json', recordingConfig).then( res => {

      console.log('[session:slug:idx] 📸  begun recording ✅');
      recording = true;
      overlay.set( null );
    }).catch( err => {
      console.error('[session:slug:idx] could not start 📸 ❌', err.toString(), Object.keys(err), err.response);
      // stop();
      axios.post('/camera/stop?as=json', {}).then( res => {
        console.log('[session:slug:idx] emergency stop was successful...');
      }).catch( err => {
        console.error('[session:slug:idx] emergency stop was unsuccessful...', err.toString());
      })
      overlay.set({
        type: 'error',
        ...err.response.data
      })
    })
  }

  function stop( e ) {


    overlay.set({
      type: 'wait',
      message: "Sending to AI..."
    })

    const conf = { action: 'stop', type: '🤖', timestamp: new Date().toISOString().substr(11, 8), message: 'stopping exercise' }
    console.log('[idx.svelte] 🤖 ⚡️ 💅  sending config STOP to AI...', conf)

    if ( window.websocketsClient ) {

      window.websocketsClient.send( JSON.stringify( conf ) )
      recording = false;
      overlay.set( null );
      const url = (zeroIdx >= session.exercises.length - 1) ? '/session/' + session.url + '/complete' : '/session/' + session.url + '/' + ( humanIdx + 1);
      console.log( '[session:slug:idx] 🛫  goto: ', url, zeroIdx, session.exercises.length)
      goto( url ); 

    } else {

      overlay.set({
        type: 'error',
        message: 'No connection to AI...'
      })

    };


    return;

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
      axios.post('/buzz?as=json', { sequence }).then( () => {

        setTimeout( () => {
          recording = false;
          const url = (zeroIdx >= session.exercises.length - 1) ? '/session/' + session.url + '/complete' : '/session/' + session.url + '/' + ( humanIdx + 1);
          console.log( '[session:slug:idx] 🛫  goto: ', url, zeroIdx, session.exercises.length)
          goto( url ); 
          overlay.set( null );
        },2000)
      });
    }).catch( err => {
      console.error('[session:slug:idx] could not stop 📸 ❌', err.toString(), Object.keys(err), err.response);
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
    <Timer className="spin" id="INTRO: {exercise.description}" bind:restart={restartTimer} on:start={onIntroStart} on:second={onIntroSecond} on:end={onIntroEnd} time={session.break_time} paused={paused} />
  {/if}
</Block>
<Row a={{grow: true}} className="align-center mlr06">

  {#if session.point_of_interest == 'sound' && exercise.example } 
    {#if exercise.example.data}
      <audio style="max-width:120px" class="mtb06 grow" src={exercise.example.data.full_url} autoplay controls />
    {/if}
  {/if}
  <div class="grow">
    <div>
      {humanIdx}/{session.exercises.length}: {exercise.description}
    </div>
    <div>
      Tags:
      {#each exercise.tags as tag}
        <span>{tag.tag_id.title}&nbsp;</span>  
      {/each}
    </div>
  </div>
</Row>


{#if recording} 
  <Row a={{grow: true}} className="mlr06" >
    <Button a={{grow: true, height: '60px'}} className="pb1" on:click={ stop }>Panic!</Button>
  </Row>
{:else}
  <a style="position: absolute; top: 50px; left: 10px;flex-direction: row;align-items: center;" href="/session/{session.url}"><ArrowLeft /> Back</a>
  <Row a={{grow: true}} className="mlr06 pb06"> 
    <Button  a={{grow: true}} on:click={ () =>  restartTimer( session.break_time+1 ) } >
      <span><Refresh /></span>
    </Button>
    <Button  a={{grow: true}} on:click={ () => paused = !paused }>
      {#if paused}
        <span><Play /></span>
      {:else}
        <span><Pause /></span>
      {/if}
    </Button>
    <Button  a={{grow: true}} on:click={ () =>  restartTimer( 11 ) } >
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