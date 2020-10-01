<script>
	import { AUI, Text, Row } from 'svelte-aui/src/index.js'
	import Inspector from './../../misc/Inspector.svelte'
	import demo from './../../misc/demo.js'

	let a = demo;

	function onInput(e) {

		try {
			const json = JSON.parse(e.detail.target.value);
			a =  json;
			console.log('CHANGE', json);
		} catch( err ) {
			console.error(err);
		}
	}

</script>


<svelte:head>
	<title>PDAC</title>
</svelte:head>

<Row style="max-height: 100vh; padding-top: 30px">
	<Inspector bind:a={a} />
	<!-- <h1>{a.children[0].children[0].value}</h1> -->
	<!-- <Text a={{variant: 'textarea', width: '200px', value: JSON.stringify(demo, null, 2) }} on:input={onInput} /> -->
	<AUI bind:a={a} />
</Row>
