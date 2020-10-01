<script>

	import Back from './Back.svelte'
	import { Any, Group } from 'svelte-aui/src/index.js'

	export let page = {};
	export let data = [];

	$: rel = ((file) => {
		return (file.indexOf('.') != -1) ? 'external' : 'prefetch';
	});

	function convertFilePath( file, exts, str ) {
		for (let i = 0; i < exts.length; i++) {
			if (file.toLowerCase().indexOf('.'+exts[i]) !== -1) {
				const idx = file.lastIndexOf('/');
				return file.substr(0,idx) + str + file.substr(idx+1);
			}
		}
		return file;
	}

	$: href = ( (file, prev ) => {
		file = page.path + '/' + file;
		if (prev) {
			file = convertFilePath( file, ['png','jpg','jpeg','svg','tiff','bmp'], '?preview=' );
			file = convertFilePath( file, ['mp4','mov','avi','mkv'], '?player=' );
		}
		return file;
	});

</script>

<style lang="sass">
	@import 'svelte-aui/src/styles/mixins'
	.overlay
		+fix
		+top-left(0px, 0px)
		+width-height( 100%, 100% )
		background: black
		z-index: 99
		video 
			+fill
		img
			object-fit: fill
		a
			+abs
			+top-right( 10px, 40px )
			z-index: 99
</style>

<Back {page} />
{#each data as file}
	<a rel={rel(file)} href={ href(file, true)}>{file}</a>
{/each}

{#if (page.query.player || page.query.preview) }

<div class="overlay player preview">
	<a>TODO:Close</a>
	{#if page.query.player }
		<video src={ href(page.query.player, false) } controls autoplay />
	{/if}
	{#if page.query.preview }
		<img src={ href(page.query.preview, false) } />
	{/if}
</div>

{/if}