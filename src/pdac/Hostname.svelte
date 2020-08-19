<script>
	import axios from 'axios'
	import Back from './Back.svelte'
	import { Any, Group, Button, Dropdown, Column } from '../svelte-aui/src/index.js';

	import { info, overlay } from './Store.js'
	export let page = {};
	export let data = {};

	let dropdown = {options: data, key: 'color'};
	let hostname;

	$: hostname = (dropdown.value !== undefined) ? dropdown.options[dropdown.value] : undefined;

	function onChanged(e) {
		hostname = dropdown.options[dropdown.value].color;
	}
	function saveHostname( e ) {
		if (hostname != undefined) {
			axios.post( `/hostname?as=json`, { hostname }).then( (res)=> {
			}).catch (err => {
				overlay.set( {type: 'error', ...err.response.data} )
			});
		}
	}

</script>

<Back {page} />
<div>Current hostname: { ($info) ? $info.hostname : 'LOADING'} </div>
<Dropdown bind:a={dropdown} on:change={onChanged} />
<Button  style="margin-top: 5px" on:click={saveHostname}>Change Hostname</Button>