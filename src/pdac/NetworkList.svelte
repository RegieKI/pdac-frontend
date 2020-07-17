<script>

	import { onMount } from 'svelte'
	import { Element, Boolean, Defines as d } from '../svelte-aui/src/index.js'
	export let page = {};
	export let data = {};

	onMount( async() => {
		console.log(page, data);
	});

	$: sorted = data.sort( (a,b) => Math.abs( parseInt(a.signal_level) ) - Math.abs( parseInt(b.signal_level) ) );

	$: freq = ( (num) => {
		if (num > 5000 && num < 6000) return "5ghz";
		if (num > 2400 && num < 2500) return "2.4ghz";
		return ((num/100)*10)+"ghz";
	});
	
</script>

<style>
</style>

{#each sorted as n}

<Element>
	<a href={`/network/connect?ssid=${n.ssid}`}>
		{n.ssid} 
		{ 100 + parseInt(n.signal_level)} 
		{ freq(n.frequency) }
	</a>
</Element>

{/each}
