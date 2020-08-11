<script>

	import { Any } from '../svelte-aui/src/index.js'
	export let page = {};
	export let data = null;
	
</script>


{#each data as d}
<Any><a href={`/session/${d.url}`}>{d.title}</a></Any>
{/each}