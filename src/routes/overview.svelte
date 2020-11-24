<script context="module">
	import { AutoPreload } from 'svelte-touch-os/src/index.js'
	export async function preload( page, session ) {  return AutoPreload(page, session, this) }
</script>

<script>

import Eye from "svelte-material-icons/Eye.svelte";
import Console from "svelte-material-icons/Console.svelte";
import { onMount } from 'svelte'
import { info, konsole, backend } from './stores.js'
import { Button } from 'svelte-aui/src/index.js'
import { Back } from 'svelte-touch-os/src/index.js'
export let data;

const API_ERROR = "❌"
const API_SUCCESS = "✅"
const API_TRY = "⚡️"

let presentation = false

onMount( async() => {

	console.log('[overview.svelte] 👁 mounted overview...')

});


$: status = $backend.status || {}
$: title = status.title || "No title"
$: message = status.message || "No message"
$: infoStyles = presentation ? 'flex flex-column align-center f5' : ''
$: lastKonsole = $konsole[0] || {}
	
</script>

<div class="flex-row flex justify-between mr06">
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
	<div>{title}</div>
	<div>{message}</div>
	{#if presentation}
		<div 
			style="font-size: 14px"
			class="konsole f3 mt08 ptb02 plr1"
			class:success={lastKonsole.type == API_SUCCESS}
			class:bright={lastKonsole.type == API_TRY}
			class:error={lastKonsole.type == API_ERROR}>
			{ lastKonsole.message || "~"  }
		</div>
	{/if}
</div>

{#if !presentation}
	<div class="konsole p04">

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