<script>
	import axios from 'axios'
	import Back from './Back.svelte'
	import { Any, Group, Button, Dropdown, Column } from '../svelte-aui/src/index.js';

	import { info } from './Store.js'
	export let page = {};
	export let data = {};

	let dropdown = {options: data, key: 'color'};
	let hostname;

	$: hostname = (dropdown.value !== undefined) ? dropdown.options[dropdown.value] : undefined;

	function onChanged(e) {
		hostname = dropdown.options[dropdown.value].color;
	}
	function saveHostname( e ) {
		console.log("save Hostname", hostname);
		if (hostname != undefined) {
			console.log('DOING POST');
			axios.post( `/hostname?as=json`, { hostname }).then( (res)=> {

				console.log('SUCCESS', res);
			}).catch (err => {
				console.log('ERROR', JSON.stringify(err) );
			});
		}
	}

</script>

<Back {page} />
<p>Change PDAC hostname:</p>
<Dropdown bind:a={dropdown} on:change={onChanged} />
<Button  style="margin-top: 5px" on:click={saveHostname}>Restart</Button>