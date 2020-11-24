<script context="module">
	import { AutoPreload } from 'svelte-touch-os/src/index.js'
	export async function preload( page, session ) {  return AutoPreload(page, session, this) }
</script>

<script>

import { onMount } from 'svelte'
import { info, konsole } from './../stores.js'
import { Button } from 'svelte-aui/src/index.js'
import { Back } from 'svelte-touch-os/src/index.js'
export let data;

const API_ERROR = "❌"
const API_SUCCESS = "✅"
const API_TRY = "⚡️"

let ws
let config = {}
let maxLines = 80

onMount( async() => {

	console.log('[overview.svelte] 👁 mounted overview...')
	info.grab().then( () => {
		const url = `ws://${$info.hostname}.local:8765`
		console.log('[overview.svelte] 👁 ⚡️  opening websocket...', url)
		ws = new WebSocket(url);
		ws.addEventListener('open', onOpen)
		ws.addEventListener('message', onMessage)
		ws.addEventListener('error', onError)

	}).catch( err => {

		console.log('[overview.svelte] 👁 ❌  could not grab info:', err.message)
	})

});

function append( str ) {

	try {
		const j = JSON.parse( str )
		konsole.update( k => {
			k.unshift( { timestamp: j.timestamp, type: j.type, message: j.message } )
			while (k.length > maxLines) k.slice(1)
			return k
		})
		console.log('[overview.svelte] 👁 ✨ ✅  parsed socket message:', $konsole.length, $konsole);
		config = j.config
	} catch( err ) {
		console.log('[overview.svelte] 👁 ✨ ❌  error parsing message:', err.message);

	}
}

function onOpen(e) {
	console.log('[overview.svelte] 👁 ✅  opened websocket...', e.currentTarget.url);
}
function onError(err) {
	console.log('[overview.svelte] 👁 ❌  opened websocket...', err);
}

function onMessage(e) {
	console.log('[overview.svelte] 👁 ✨  received websocket message...', e.data);
	append( e.data )
}

$: status = config.status || {}
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
				class:error={m.type == API_ERROR}>
				{m.message}
			</span>
		</div>
	{/each}

</div>