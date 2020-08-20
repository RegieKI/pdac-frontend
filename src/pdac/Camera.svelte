<script>

	import { onMount } from 'svelte'
	import axios from 'axios'
	import Back from './Back.svelte'
	import WebCam from './../helpers/WebCam.svelte'
	import { Timestamp } from './../helpers/Utils.js'
	import { Column, Button, Toggle, Text, Row } from '../svelte-aui/src/index.js';

	import { info, overlay } from './Store.js'
	export let page = {};
	export let data = {};

	let sessionId = { value: 'camera_test_'+Timestamp() }; 

	let audioSettings = { value: false };
	let videoSettings = { value: true };
	let heartRateSettings = { value: false };

	let rtspSettings = { value: false };
	let fileSettings = { value: false };
	let windowSettings = { value: true };

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

		console.log('[Camera] 📸 opening camera', config)

		overlay.set( { type: 'wait', message: 'Opening camera' } )
		axios.post('/camera/start?as=json', config).then( (res) => {
			console.log('[Camera] 📸 ✅  successfully started')
			overlay.set( null )
		}).catch( err => {
			console.log(
				'[Camera] ❌ error starting:',
				err.response.data
			)
			overlay.set( {type: 'error', ...err.response.data} )
		}).finally( e => {
			info.grab();    
		})
	}

	function stop() {

		overlay.set( { type: 'wait', message: 'Closing camera' } )
		axios.post('/camera/stop?as=json', {}).then( (res) => {
			console.log('[Camera] 📸 🛑  successfully stopped')
			overlay.set( null ) 
		}).catch( err => {
			console.log('[Camera] ❌ error stopping:', err.response.data )
			overlay.set( {type: 'error', ...err.response.data} )
		}).finally( e => {
			info.grab();
		})
	}


	onMount( async() => {

		if (process.browser && navigator.mediaDevices) { 
		  navigator.mediaDevices.enumerateDevices().then(function (devices) {
	      for(var i = 0; i < devices.length; i ++){
	          var device = devices[i];
	          if (device.kind === 'videoinput') {
	          	console.log('[Camera] 🎥  camera available', i, {...device});
	          }
	      }
		  });
		}
	 });

	function checkNested(obj, level,  ...rest) {
		if (obj === undefined) return false
		if (rest.length == 0 && obj.hasOwnProperty(level)) return true
		return checkNested(obj[level], ...rest)
	} 


	$: isCameraOpen = ($info) ? (( checkNested($info, 'backend', 'session', 'running') ) ? $info.backend.session.running : false) : false;

</script>

<Back {page} />
<!-- <Column> -->
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
		<Button><a href="/camera/preview">Preview</a></Button>
		{#if isCameraOpen} 
			<Button on:click={stop}>Stop</Button>
		{:else}
			<Button on:click={start}>Start</Button>
		{/if}
	</Row>
<!-- </Column> -->