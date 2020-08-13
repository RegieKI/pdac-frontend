<script>


	import {goto} from '@sapper/app';
	import { Any, Button, Column } from '../svelte-aui/src/index.js'
	export let page = {};
	export let data = null;
	import Viewer from './Viewer.svelte'
	import Back from './Back.svelte'
	import { info } from './Store.js'
	import { onMount } from 'svelte'


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
			t += ex.time;
		})
		return t;
	});

	function onExerciseChanged( query ) {
		if (!query.exercise) return -1;

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

	const delay = time => new Promise(res=>setTimeout(res,time));

	async function onFrame() {
		const t = ((new Date()) - timeline.timestamp)/1000;
		const abs = Math.round( t );

		if ( abs != timeline.counter ) console.log('[PDAC] Counting...', abs);
		timeline.counter = abs;
		timeline.human = ( timeline.status == 0) ? session.break_time - t : exercise.time - t;
		timeline.percent = ( timeline.status == 0) ? 100 - timeline.human/session.break_time*100 : 100 - timeline.human/exercise.time*100;


		if (t >= session.break_time && timeline.status == 0) {
			setTimeout( () => {

				console.log('[PDAC] Begin recording...', exercise.time);
				timeline.status = 1;
				timeline.counter = -1;
				timeline.timestamp = (new Date()); 
				window.requestAnimationFrame(onFrame);
			}, 2000);
		} else if (t >= exercise.time && timeline.status == 1) {

			setTimeout( () => {
				console.log('[PDAC] Stop recording...');
				timeline.status = 2;
				goto(nextPath);

			},2000);
		} else {
			window.requestAnimationFrame(onFrame);
		}
	}


	$: exerciseIndex = parseInt( onExerciseChanged( page.query ), 10);
	$: exercise = (exerciseIndex <= session.exercises.length && exerciseIndex > 0) ? session.exercises[exerciseIndex-1].exercise_id : null;

	$: previousPath = `${page.path}?exercise=${exerciseIndex - 1}`;
	$: nextPath = `${page.path}?exercise=${exerciseIndex + 1}`;


</script>


<!-- <div class={`recording-session status-${timeline.status}`}> -->
	{#if exerciseIndex == -1 }
	<Back {page} />
	<div>{session.title}</div>
	<div>{session.exercises.length} exercise(s), {totalTime()} seconds in total</div>
	<div class="html">
		{@html session.description}
	</div>
	<Button><a href={nextPath}>Start Session</a></Button>

	{:else if exerciseIndex == 0}

	<Back {page} />
	<Viewer />
	<Column a={{stretch: true, justify: 'flex-end'}}>
	<Button style="margin-top:140px"><a href={nextPath}>OK, Begin</a></Button>
	</Column>


	{:else}

	<div>{exercise.description}</div>
	<div class="tags">
	{#each exercise.tags as tag}
	<span>{tag.tag_id.title}</span>  
	{/each}
	</div>
	<div>
		{#if timeline.status == 0}
			Waiting
		{:else if timeline.status == 1}
			Recording
		{/if}
		<div class={`bar status-${timeline.status}`}>
			<div class="inner" style={`width: ${timeline.percent}%`}></div>
		</div>
	</div>

	{/if}

<!-- </div> -->

<style lang="sass">
	.bar
		width: 100%
		height: 10px
		position: relative
		.inner
			position: absolute
			top: 0
			left: 0
			height: 100%
			background: white

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