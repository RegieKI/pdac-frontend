<script>

	import { Any, Boolean, Defines as d } from '../svelte-aui/src/index.js'
	import { info } from './Store.js'
	export let page = {};
	export let data = {};


	function onDisconnect(e) {

		if (!e.detail.props.value) return;
		console.log(params, "POST");
		const r = fetch( '/network.json?foo=bar', {
			method: 'post',
			headers: {'Content-Type' : 'application/json'},
			body: JSON.stringify( params )
		}).then( () =>{

		}).catch( err => {

		});
		// const res = r.json();
		// console.log(res);
	}
	
</script>

<style>
</style>

{#if $info.isConnected}
	<p>Connected:</p>
	<p>
		SSID: {$info.connection.ssid} <br />
		Frequency: {$info.connection.freq} <br />
		Quality: {$info.connection.quality}%
	</p>
{:else}
	NOPE	
{/if}
<Any a={{type: d.BTN}} on:updated={onDisconnect}>
	<a href="/network/list"> { ($info.isConnected) ? "Reconnect" : "Connect" }</a>
</Any>