<script>

	import { Element } from '../svelte-aui/src/index.js'
	export let page = {};
	export let data = null;
	
</script>

<style>
</style>

{#each data as d}
<Element><a href={`/session/${d.url}`}>{d.title}</a></Element>
{/each}