<script>

	import { Element, Boolean, Group, Defines as d } from '../svelte-aui/src/index.js'
	export let page = {};
	export let data = {};

	const keys = {
		default: [
			['q','w','e','r','t','y','u','i','o','p']
			['a','s','d','f','g','h','j','k','l']
			['shift','z','x','c','v','b','n','m','back']
			['switch','space','.','enter']
		],
		numbers: [
			['1','2','3','4','5','6','7','8','9','0'],
			['-','/',':',';','(',')','$','&','@','"'],
			['shift','.',',','?','!','\'','back'],
			['switch','space','.','enter']
		]
	}
	
</script>

<style>
</style>

{#each keys['default'] as line }
	<Group>
		{#each line as char}
			<Element a={{type: d.BTN}}>
				char
			</Element>
		{/each}
	</Group>
{/each}