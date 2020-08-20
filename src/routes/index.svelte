<script context="module">
	export async function preload( page ) {
		return { conf: { page } };
	};
</script>

<script>
	import PDAC from '../pdac/PDAC.svelte'
	export let conf;
</script>

<svelte:head>
	<title>PDAC</title>
</svelte:head>

<PDAC {...conf} />