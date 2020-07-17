<script>

	import { Element, Boolean, Defines as d } from '../svelte-aui/src/index.js'
	export let page = {};
	export let data = {};

	let params = {
		hello: 'world'
	}

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
<Element a={{type: d.BTN}} on:updated={onDisconnect}>
	<a href="/network/list">Connect</a>
</Element>