<script>

	import axios from 'axios'
	import { Timestamp } from './../helpers/Utils.js'
	import {goto} from '@sapper/app';
	import { Any, Button, Column } from '../svelte-aui/src/index.js'
	export let page = {};
	export let data = null;
	import Viewer from './Viewer.svelte'
	import Back from './Back.svelte'
	import { info, overlay } from './Store.js'
	import { onMount } from 'svelte'
	import WebCam from './../helpers/WebCam.svelte'


	let timeline = {
		previousIndex: null,
		timestamp: 0,
		status: 0,
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

	function onExerciseChanged( query ) {
		if (!query.exercise) return -1;

		if ( parseInt(query.exercise) > session.exercises.length) return query.exercise;
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

		if ( abs != timeline.counter ) console.log('[PDAC] Counting...', abs);
		timeline.counter = abs;
		timeline.human = ( timeline.status == 0) ? session.break_time - t : exercise.time - t;
		timeline.percent = ( timeline.status == 0) ? 100 - timeline.human/session.break_time*100 : 100 - timeline.human/exercise.time*100;


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

	$: identifier = (exercise && $info) ? `${$info.hostname}_${session.title}_${exerciseIndex}_${exercise.tags.map( t => {
		return t.tag_id.title; 
	})}` : 'none';

	$: exerciseIndex = parseInt( onExerciseChanged( page.query ), 10);
	$: exercise = (exerciseIndex <= session.exercises.length && exerciseIndex > 0) ? session.exercises[exerciseIndex-1].exercise_id : null;

	$: previousPath = `${page.path}?exercise=${exerciseIndex - 1}`;
	$: nextPath = `${page.path}?exercise=${exerciseIndex + 1}`;


	let useHeartrate = true;
	let isHRConnected = false;

	$: recordingConfig = {
		'session-id': `${Timestamp()}_${identifier}`,
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

		<Back {page} />
		<div>
			{session.title}: 
			{session.exercises.length} exercise(s), 
			{totalTime()} seconds in total
		</div>
		<div class="html">
			<div>{@html session.description}</div>
		</div>
		<Button><a href={nextPath}>Start Session</a></Button>

	{:else if exerciseIndex == 0}

		<!-- preview video -->

		{#if useHeartrate && !isHRConnected}
			<Back {page} />
			<div>MiBand is not connected<br />Address: {mac_address}</div>
			<Button on:click={reconnectHR}>Reconnect</Button>
			<Button on:click={ e => { useHeartrate = false } } >Skip</Button>
		{:else}
			<WebCam on:click={ e => goto(nextPath) } />
			<!-- <Button><a href={nextPath}>OK, Begin</a></Button> -->
		{/if}

	{:else if exerciseIndex > session.exercises.length}

		<!-- finished! -->

		<div>
			{session.title}: Completed
		</div>
		<Button><a href="/usb/recordings">View Recordings</a></Button>
		<Button><a href="/session">Back to Sessions</a></Button>

	{:else}

		<!-- exercide (idx) -->

		<div class={`circle ${ (timeline.status == 1) ? 'active' : '' }`} />
		<div>
			<div>
				Exercise {exerciseIndex}/{session.exercises.length}: 
				{exercise.description}
			</div>
			<div>Identifier: {identifier}</div>
			<div>
				Tags:
				{#each exercise.tags as tag}
					<span>{tag.tag_id.title}</span>  
				{/each}
			</div>
		</div>
		<div>
			{#if timeline.status == 0}
				Countdown:
			{:else if timeline.status == 1}
				Recording:
			{/if}
			<div class={`bar status-${timeline.status}`}>
				<div class="inner" style={`width: ${timeline.percent}%`}></div>
			</div>
		</div>
		<Button><a href={nextPath}>Skip</a></Button>

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