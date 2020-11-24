<script context="module">
	import { AutoPreload } from 'svelte-touch-os/src/index.js'
	export async function preload( page, session ) {  return AutoPreload(page, session, this) }
</script>

<script>

import { onMount } from 'svelte'
import { info, konsole, backend } from './../stores.js'
import { Button } from 'svelte-aui/src/index.js'
import { Back } from 'svelte-touch-os/src/index.js'
export let data;

const API_ERROR = "❌"
const API_SUCCESS = "✅"
const API_TRY = "⚡️"


onMount( async() => {

	console.log('[overview.svelte] 👁 mounted overview...')

});


$: status = $backend.status || {}
$: title = status.title || "No title"
$: message = status.message || "No message"
	
</script>

<Back />
<div class="plr1">
	<div>{title}</div>
	<div>{message}</div>
</div>
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