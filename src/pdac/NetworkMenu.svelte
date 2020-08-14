<script>

	import Back from './Back.svelte'
	import { Button } from '../svelte-aui/src/index.js'
	import { info } from './Store.js'
	export let page = {};
	export let data = {};
	
</script>

<Back {page} />
{#if $info.isConnected}
	<p>Connected to: </p>
	<p>{$info.connection.ssid}</p>
{:else}
	
{/if}
<Button><a href="/network/list"> { ($info.isConnected) ? "Change Network" : "Connect" }</a></Button>