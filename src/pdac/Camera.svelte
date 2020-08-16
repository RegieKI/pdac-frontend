<script>

	import axios from 'axios'
	import Back from './Back.svelte'
	import { Column, Button, Toggle, Text, Row } from '../svelte-aui/src/index.js';

	import { info, overlay } from './Store.js'
	export let page = {};
	export let data = {};

	let sessionId = { value: "test" };

	let audioSettings = { value: false };
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

		overlay.set( { type: 'wait', message: 'Opening camera' } )
		axios.post('/start?as=json', config).then( (res) => {
			console.log('[Camera] 📸 ✅  successfully started')
			overlay.set( null )
		}).catch( err => {
			console.log(
				'[Camera] ❌ error starting:',
				err.response.data
			)
			overlay.set( {type: 'error', ...err.response.data} )
		});
	}

	function stop() {

		overlay.set( { type: 'wait', message: 'Closing camera' } )
		axios.post('/stop?as=json', {}).then( (res) => {
			console.log('[Camera] 📸 🛑  successfully stopped')
			overlay.set( null )
		}).catch( err => {
			console.log('[Camera] ❌ error stopping:', err.response.data )
			overlay.set( {type: 'error', ...err.response.data} )
		});
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