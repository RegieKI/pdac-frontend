<script>
	import Back from './../pdac/Back.svelte'
	export let status;
	export let error;
	export let message;
	export let response;

	import { Column, Button } from '../svelte-aui/src/index.js'
	const dev = process.env.NODE_ENV === 'development';
	console.log(error, status, message ,response);
</script>

<style lang="sass" global>
@import '../styles'
</style>

<svelte:head>
	<title>{status}</title>
</svelte:head>

<div class="error">
		<Back />
		<p>{status}</p>
		<p>{error.message}</p>
		<Button on:click={ () => window.location = window.location } >Refresh</Button>

		{#if dev && error.stack}
			<pre>{error.stack}</pre>
		{/if}
</div>