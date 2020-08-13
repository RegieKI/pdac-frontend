<script>

	import axios from 'axios'
	import Back from './Back.svelte'
	import { POST, GET, PUT } from '../helpers/Utils.js'
	import { Column, Button, Toggle, Text, Row } from '../svelte-aui/src/index.js';

	import { info } from './Store.js'
	export let page = {};
	export let data = {};

	let sessionId = { value: "test" };

	let audioSettings = { value: true };
	let videoSettings = { value: true };
	let heartRateSettings = { value: true };

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

		console.log('SENDING CONFIG', config);

		axios.post('/start?as=json', config).then( (res) => {
			console.log('SUCCESSSsssss!!!!!', res);
		}).catch( err => {
			console.log('ERRROOOORRRR', err);
		});
	}

	function stop() {

	}

</script>

<Back {page} />
<Column>
	<Text bind:a={sessionId} />
	<Row>
		<Toggle bind:a={audioSettings}>Audio</Toggle>
		<Toggle bind:a={videoSettings}>Video</Toggle>
		<Toggle bind:a={heartRateSettings}>Heartrate</Toggle>
	</Row>
	<Row>
		<Toggle bind:a={rtspSettings}>RTSP</Toggle>
		<Toggle bind:a={fileSettings}>File</Toggle>
		<Toggle bind:a={windowSettings}>Window</Toggle>
	</Row>
	<Row>
		<Button on:click={start}>Start</Button>
		<Button on:click={stop}>Stop</Button>
	</Row>
</Column>