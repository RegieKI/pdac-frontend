<script>


	import { Any, Button, Column } from '../svelte-aui/src/index.js'
	export let page = {};
	export let data = null;
	import Viewer from './Viewer.svelte'
	import Back from './Back.svelte'
	import { info } from './Store.js'
	import { onMount } from 'svelte'


	let timeline = {
		previousIndex: null,
		timestamp: 0
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
			timeline.previousIndex = query.exercise;
			timeline.timestamp = (new Date());
			const e = session.exercises[query.exercise];
			console.log('New exercise index', query.exercise, e);
			if ( parseInt( query.exercise ) > 0 && window ) window.requestAnimationFrame(onFrame);
		}

		return query.exercise;
	}

	function onFrame() {
		const t = Math.round( ((new Date()) - timeline.timestamp)/1000 );
		console.log('Frame...', t, session.break_time, exercise.time);

		if (t < session.break_time + exercise.time) {
			window.requestAnimationFrame(onFrame);
		} else {
			console.log('STOP!!!');
		}
	}


	$: exerciseIndex = parseInt( onExerciseChanged( page.query ), 10);
	$: exercise = (exerciseIndex <= session.exercises.length && exerciseIndex > 0) ? session.exercises[exerciseIndex-1].exercise_id : null;

	$: previousPath = `${page.path}?exercise=${exerciseIndex - 1}`;
	$: nextPath = `${page.path}?exercise=${exerciseIndex + 1}`;



</script>


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

<div>{exercise.description} {$info.hostname}</div>

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