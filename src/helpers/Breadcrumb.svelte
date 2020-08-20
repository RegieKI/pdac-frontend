<script>
	export let page = [];

	$: url = ((idx) => {
		let u = ''
		for( let i = idx; i !== -1; i--) u = `/${page.params.slug[i]}${u}`
		return u;
	});
</script>

<style>
</style>


<div class="ez-slug">
{#each page.params.slug as s, i }

	<a href={url(i)}>{s}</a>

{/each}
</div>