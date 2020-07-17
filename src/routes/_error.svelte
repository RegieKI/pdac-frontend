<script>
	export let status;
	export let error;

	import { Element, Group, Defines as d } from '../svelte-aui/src/index.js'
	const dev = process.env.NODE_ENV === 'development';
</script>

<style>
	h1, p {
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	p {
		margin: 1em auto;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<svelte:head>
	<title>{status}</title>
</svelte:head>

<Group>
<Element>
	<p>{status}</p>
	<p>{error.message}</p>
</Element>
<Element><a href="/network">Network</a></Element>
<Element a={{type: d.BTN}} on:trigger={ () => window.location = window.location } >Refresh</Element>


{#if dev && error.stack}
	<Element><pre>{error.stack}</pre></Element>
{/if}
</Group>
