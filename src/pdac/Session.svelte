<script>
	export let session;
	let currentExercise = null;
	let idx = -1;
	let timestamp = 0;

	function totalTime() {
		let t = 0;
		session.exercises.forEach( e => {
			const ex = e.exercise_id;
			t += ex.time;
		})
		return t;
	}


	function speak( text, speed ) {

		let speak = new SpeechSynthesisUtterance(text);
		speak.lang = 'de-DE';
		speak.pitch = 0;
		speak.rate = speed;
		let voices = window.speechSynthesis.getVoices();
		speak.voice = voices[3];
		window.speechSynthesis.speak(speak);
	}

	function restart() {

		idx = 0;
		prepareRecording( );
	}

	function prepareRecording( ) {
		setExercise(0);

		let sp = "Dramaturgy... ";
		currentExercise.tags.forEach( t => {
			sp += t.tag_id.title + "! . ";
		});
		speak(sp, 0.8);
		setTimeout( (e) => {
			startRecording( );
		}, 6000);
	}

	function startRecording( ) {
		timestamp = new Date();
		setTimeout( e => {

		}, currentExercise.time * 1000);
	}

	function stopRecording() {

		setExercise(0);
	}

	function setExercise( idx ) {

		if (idx < 0 || idx >= session.exercises.length) console.error("Cannot set exercise");
		currentExercise = {...session.exercises[idx].exercise_id};
	}

</script>

<div class="session">
	<h1>{session.title}</h1>
	<p>This session will take {totalTime()} seconds in total</p>
	<button on:click={restart}>Start</button>

	<section class="introducton">
		<h1>Introduction</h1>
		<div class="html">
			{@html session.description}
		</div>
	</section>
	{#if currentExercise}
		<section class="dramaturgy">
			Dramaturgy: 
			<ul>
				{#each currentExercise.tags as tag}
					<li>{tag.tag_id.title}: {tag.tag_id.description}</li>
				{/each}
			</ul>
		</section>
	{/if}

</div>