<script>
	import { Back } from 'svelte-touch-os/src/index.js'
	export let status;
	export let error;
	export let message;
	export let response;

	import { Column, Button, Row } from 'svelte-aui/src/index.js'
	const dev = process.env.NODE_ENV === 'development';
	console.log(error, status, message ,response);

	export async function preload( page ) {
			axios.post('/camera/stop?as=json', {});
	};
</script>


<svelte:head>
	<title>{status}</title>
</svelte:head>

<Back history={true} />
<div>
	<h2>{status}</h2>
	{error.message}
</div>
<Row a={{grow: true}} className="m06">
	<Button a={{grow: true}} style="width:100%;"><a href="/">Home</a></Button>
	<Button a={{grow: true}} style="width:100%;" on:click={ () => window.location = window.location } >Refresh</Button>
</Row>
{#if dev && error.stack}
	<pre>{error.stack}</pre>
{/if}