<script>
	import Back from './../helpers/Back.svelte'
	export let status;
	export let error;
	export let message;
	export let response;

	import { Column, Button } from '../svelte-aui/src/index.js'
	const dev = process.env.NODE_ENV === 'development';
	console.log(error, status, message ,response);

	export async function preload( page ) {
			axios.post('/camera/stop?as=json', {});
	};
</script>


<svelte:head>
	<title>{status}</title>
</svelte:head>

<div>{status}: {error.message}</div>
<Button><a href="/">Home</a></Button>
<Button on:click={ () => window.location = window.location } >Refresh</Button>
{#if dev && error.stack}
	<pre>{error.stack}</pre>
{/if}