<script context="module">
	import { AutoPreload } from 'svelte-touch-os/src/index.js'
	export async function preload( page, session ) {  return AutoPreload(page, session, this) }
</script>

<script>

import Eye from "svelte-material-icons/Eye.svelte";
import Console from "svelte-material-icons/Console.svelte";
import { onMount } from 'svelte'
import { info, konsole, backend, eyeball } from './stores.js'
import { Button } from 'svelte-aui/src/index.js'
import { Back } from 'svelte-touch-os/src/index.js'
import { API_ERROR, API_SUCCESS, API_TRY, API_VIZ } from './types.js'
export let data;


let presentation = true

onMount( async() => {

	console.log('[overview.svelte] 👁 mounted overview...')

}); 

function onButtonPress() {

	try {
		if (window.websocketsClient) {
			console.log('[overview.svelte] 👈  🌐 sending websockets button press')
			window.websocketsClient.send( JSON.stringify( { type: '👈', title: 'button', timestamp: new Date().toISOString().substr(11, 8), message: 'button pressed' }  ) )
		} else {
			console.log('[overview.svelte] ❌ no websockets client!')
		}
	} catch(err) {

	}
}


$: viz = $eyeball || { title: 'No visualisation', message: 'No visualisation', button: 'No button' }
$: infoStyles = presentation ? 'flex flex-column align-center f5 grow' : ''
$: lastKonsole = $konsole[0] || {}
	
</script>

<div class="flex-row flex justify-content-between mr06">
	<Back />
	<Button on:click={ e => presentation = !presentation }>
		{#if !presentation}
			<Eye width="4em" height="1.2em" />
		{:else}
			<Console width="4em" height="1.2em"  />
		{/if}
	</Button>
</div>
<div class="plr1 {infoStyles}">
	<div>{viz.title}</div>
	<div>{viz.message}</div>
	{#if viz.button && presentation }
		<Button className="align-self-stretch mtb08" a={{grow: true}} on:click={onButtonPress}>{viz.button}</Button>
	{/if}
</div>

{#if !presentation}
	<div class="konsole p04 grow">

		{#each $konsole as m, i }
			<div>
				<span class="fade">[{m.timestamp}]</span>
				<span
					class:success={m.type == API_SUCCESS}
					class:bright={m.type == API_TRY}
					class:error={m.type == API_ERROR}>
					{m.message}
				</span>
			</div>
		{/each}

	</div>
{/if}