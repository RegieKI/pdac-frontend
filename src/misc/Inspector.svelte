<script>
	import { Button, Row, Column } from 'svelte-aui/src/index.js'
	import Item from './Item.svelte'
	export let a = {};
	export let className;
	export let style;
	let key;

	function onFocus(e) {
		key = document.activeElement.getAttribute('data-key') || key;
		console.log('FOCUS', key);
	}
</script>

<svelte:window on:focus|capture={onFocus}/>

<template>
	<Column {style} {className}>
		<Item {a} {key} />
	</Column>
</template>


