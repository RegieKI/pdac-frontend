<script context="module">
  import { AutoPreload } from './../../helpers/Utils.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>
<script>

  import axios from 'axios'
  import { onMount } from 'svelte'
  import { goto } from '@sapper/app';

  // stores...

  import { info, overlay } from './../stores.js'
  import { stores } from '@sapper/app';
  const { page } = stores();

  // icons ...

  import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";
  import TimerSand from "svelte-material-icons/TimerSand.svelte";
  import RadioboxMarked from "svelte-material-icons/RadioboxMarked.svelte";

  // helpers...

  import { Timestamp } from './../../helpers/Utils.js'
  import WebCam from './../../helpers/WebCam.svelte'
  import Back from './../../helpers/Back.svelte'
  import AudioLevels from './../../helpers/AudioLevels.svelte'
  import { Any, Button, Column, Row } from '../../svelte-aui/src/index.js'


  export let data;

  let timeline = {
    previousIndex: null,
    timestamp: 0,
    status: -1,
    counter: -1,
    human: -1,
    percent: ''
  };

  $: session = data[0];

  $: totalTime = (() => {
    let t = 0;
    session.exercises.forEach( e => {
      const ex = e.exercise_id;
      if (ex.time) t += ex.time;
    })
    return t;
  });

  function startExercise( ) {
    const query = $page.query;
    if (!query.exercise) return -1;
    timeline.status = 0;

    if (query.exercise != timeline.previousIndex) {
      const e = session.exercises[query.exercise];
      console.log('[PDAC] Starting process...', query.exercise, e);
      if ( parseInt( query.exercise ) > 0 && process.browser === true ) {
        for (var i = 1; i < 99999; i++) {
          window.clearInterval(i);
          window.cancelAnimationFrame(i);
        }
        window.requestAnimationFrame(onFrame);
        timeline.status = 0;
        timeline.counter = -1;
        timeline.previousIndex = query.exercise;
        timeline.timestamp = (new Date());
      }
    }

    return query.exercise;
  }


  async function onFrame() {
    const t = ((new Date()) - timeline.timestamp)/1000;
    const abs = Math.round( t );

    if ( abs != timeline.counter ) {
      const ss = session.break_time - abs;
      console.log('[PDAC] Counting...', ss);
      axios.post('/buzz?as=json', { sequence: (ss == 1) ? '1000 50 1 0.000095' : '100 100 1 0.0005' });
    }
    const countdown = ( timeline.status == 0) ? session.break_time - t : exercise.time - t;
    timeline.counter = abs;
    timeline.human = parseInt( countdown, 10);
    timeline.percent = ( timeline.status == 0) ? 100 - countdown/session.break_time*100 : 100 - countdown/exercise.time*100;


    if (t >= session.break_time && timeline.status == 0) {

      console.log('[Session] 📸  Begin recording...', exercise.time, recordingConfig);

      axios.post('/camera/start?as=json', recordingConfig).then( res => {

        console.log('[Session] 📸  Begun recording ✅');

        timeline.status = 1;
        timeline.counter = -1;
        timeline.timestamp = (new Date()); 
        window.requestAnimationFrame(onFrame);
      }).catch( err => {
        console.log('[Session] Could not start 📸 ❌', err.toString(), Object.keys(err), err.response);
        overlay.set({
          type: 'error',
          ...err.response.data
        })
      })
    } else if (t >= exercise.time && timeline.status == 1) {

      console.log('[Session] 📸  Stop recording...');
      axios.post('/camera/stop?as=json', {}).then( res => {

        console.log('[Session] 📸  Stopped recording ✅');
        timeline.status = 2;
        goto(nextPath);
      }).catch( err => {
        console.log('[Session] Could not stop 📸 ❌', err.toString(), Object.keys(err), err.response);
        overlay.set({
          type: 'error',
          ...err.response.data
        })
      })
    } else {
      window.requestAnimationFrame(onFrame);
    }
  }

  $: identifier = (exercise && $info) ? `${$info.hostname}_${session.point_of_interest}_${session.url}_${exerciseIndex}_${exercise.tags.map( t => {
    return t.tag_id.url; 
  })}` : 'none';

  $: exerciseIndex = parseInt( (!$page.query.exercise) ? -1 : $page.query.exercise, 10);
  $: exercise = (exerciseIndex <= session.exercises.length && exerciseIndex > 0) ? session.exercises[exerciseIndex-1].exercise_id : null;

  $: previousPath = `${$page.path}?exercise=${exerciseIndex - 1}`;
  $: nextPath = `${$page.path}?exercise=${exerciseIndex + 1}`;


  let useHeartrate = true;
  $: isHRConnected = ($info) ? ($info.backend) ? $info.backend.miband.connected : false : false;

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
        active: useHeartrate
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


  $: mac_address =  ($info) ? $info.backend.mac_address : 'UNKNOWN';

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
    overlay.set( { type: 'wait', message: 'Reconnecting to ' + mac_address } )

    axios.post('/miband/reconnect?as=json', {}).then( res => {

        console.log('[Session] ⌚️✅  Miband connected');
        overlay.set(null);
    }).catch( err => {

        console.log('[Session] ⌚️❌ Miband could not reconnect ', err.toString(), Object.keys(err), err.response);
        overlay.set({
          type: 'error',
          ...err.response.data
        })
    })
  }

</script>

  {#if exerciseIndex == -1 }

    <!-- introduction -->

    <Back />
   <div>
      {session.title}: <br />
      {session.exercises.length} exercise(s), 
      {totalTime()} seconds in total
    </div>
    <div style="padding: 0.5em 0em">{@html session.description}</div>
    <Button><a href={nextPath}>Start Session</a></Button>

  {:else if exerciseIndex == 0}

    <!-- preview video -->

    {#if useHeartrate && !isHRConnected}
      <Back />
      <div>MiBand is not connected<br />Address: {mac_address}</div>
      <Button on:click={reconnectHR}>Reconnect</Button>
      <Button on:click={ e => { useHeartrate = false } } >Skip</Button>
    {:else}
      <!-- <Back {page} /> -->

      {#if session.point_of_interest == 'sound'}
        <AudioLevels />
      {:else}
        <WebCam/>
      {/if}
      <Button a={{stretch: true}} style="position:absolute;width:calc( 50% - 20px );bottom:10px;left:10px;"><a href={previousPath}><ArrowLeft />Back</a></Button>
      <Button a={{stretch: true}} style="position:absolute;width:calc( 50% - 20px );bottom:10px;right:10px;"><a href={nextPath}>OK, Begin</a></Button>
    {/if}

  {:else if exerciseIndex > session.exercises.length}

    <!-- finished! -->

    <div>
      {session.title}: Completed
    </div>
    <!-- <Button><a href="/usb/recordings">View Recordings</a></Button> -->
    <Button><a href="/session">Back to Sessions</a></Button>

  {:else}

    <!-- exercide (idx) -->

    <div class={`circle ${ (timeline.status == 1) ? 'active' : '' }`} />

    {#if timeline.status == -1}
      <Back  />
    {/if}

    <div>
      <h3>
        {exerciseIndex}/{session.exercises.length}: 
        {exercise.description}
      </h3>
      {#if timeline.status == -1}
        <div>
          Tags:
          {#each exercise.tags as tag}
            <span>{tag.tag_id.title}&nbsp;</span>  
          {/each}
        </div>
        <div>ID: {identifier}</div>

        <!-- sound -->

        {#if session.point_of_interest == 'sound'}
          <audio style="width:100%" src={exercise.example.data.full_url} controls />
        {/if}
      {/if}
    </div>

    {#if timeline.status == -1}

      <!-- exercise overview... -->

      <Row style="margin-top: 20px">
        <Button a={{stretch: true}} ><a href={nextPath}>Skip</a></Button>
        <Button a={{stretch: true}} on:click={startExercise}>Start</Button>
      </Row>


    {:else if timeline.status == 0}

      <!-- countdown... -->

      <div style="font-size: 100px;line-height:80px">{timeline.human}</div>
      <div>
        Countdown:
        <div class={`bar status-${timeline.status}`}>
          <div class="inner" style={`width: ${timeline.percent}%`}></div>
        </div>
      </div>
      <Button a={{stretch: true}} on:click={() => window.location.reload() }>Cancel</Button>

    {:else if timeline.status == 1}

      <!-- recording... -->

      <RadioboxMarked />
      <div>
        Recording:
        <div class={`bar status-${timeline.status}`}>
          <div class="inner" style={`width: ${timeline.percent}%`}></div>
        </div>
      </div>
      <Button a={{stretch: true}} on:click={() => window.location.reload() }>Cancel</Button>

    {/if}




  {/if}

<!-- </div> -->

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