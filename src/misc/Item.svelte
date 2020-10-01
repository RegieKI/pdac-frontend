<script>
	import { Button, Row, Column, Text } from 'svelte-aui/src/index.js'
	import Item from './Item.svelte'
	export let a = {};
	export let key;

	let current = "";


	const ids = ['flex-basis', 'flex-grow', 'width', 'height'];
</script>

<template>
	<Button>{a.name} ({a.key})</Button>


	{#if key == a.key && key}
		{#each Object.keys(a) as key }
			{#if key != 'children'}
				<Text a={{value: a[key], name: key}} />
			{/if}
		{/each}
	{/if}

	{#if a.children}
		<Column style="padding-left:0.4rem">


			{#each a.children as child}
			<Item a={child} {key} />
			{/each}
		</Column>
	{/if}

</template>


