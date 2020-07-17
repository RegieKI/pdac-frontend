<script>
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte'
	import { MEM } from '../helpers/Utils.js'


	import { Element, Group } from '../svelte-aui/src/index.js'
	import Files from '../helpers/Files.svelte'
	import Breadcrumb from '../helpers/Breadcrumb.svelte'
	import SessionsList from './SessionsList.svelte'
	import NetworkList from './NetworkList.svelte'
	import NetworkMenu from './NetworkMenu.svelte'
	import NetworkConnect from './NetworkConnect.svelte'
	import MainMenu from './MainMenu.svelte'

	import { info } from './Store.js'

	export let page = {};
	export let data = null;
	let PdacEl;

	let initX, initY, scrollTop = undefined;
	let deltaX, deltaY = 2;


	function onMousedown(e) {
		if (typeof initX == 'undefined' && typeof initY == 'undefined') {
			initX = e.pageX;
			initY = e.pageY;
			scrollTop = PdacEl.scrollTop;
		}

	}
	function onMousemove(e) {
		if (typeof initX !== 'undefined' && typeof initY !== 'undefined') {
			const diffX = e.pageX - initX;
			const diffY = e.pageY - initY;
			if ( (diffX > deltaX) || (diffX < -deltaX) || (diffY > deltaY) || (diffY < -deltaY) ) {
				PdacEl.scrollTop = scrollTop - diffY;
			}
		}
	}
	function onMouseup(e) {
		initX = undefined;
		initY = undefined;
		// e.preventDefault();
		// e.stopPropagation();
	} 

	onMount( async() => {
		await info.grab();
	});

	$: memory = ( () => {
		if (!$info) return undefined;
		if (!$info.freemem) return undefined;
		const mem = MEM( $info.freemem );
		return mem[mem.use] + mem.use;
	})

	$: connection = ( () => {
		if (!$info) return undefined;
		if (!$info.connections) return {};
		const c = $info.connections;
		if ( c.length === 0 ) return "No Connection";
		return c[0];
	});

	$: id = ( page.path !== '/') ? 'pdac' + page.path.replace(/\//g, '-') : 'pdac-home';

	$: back = ( () => {
		if ( !page.params ) return '/';
		if ( !page.params.slug ) return '/';
		return '/' + page.params.slug.slice(0,page.params.slug.length-1).join('/')
	});


</script>

<svelte:head>
	<title>PDAC</title>
</svelte:head>

<svelte:window
	on:mousemove={onMousemove}
	on:mouseup={onMouseup}
	/>
<div bind:this={PdacEl} on:mousedown={onMousedown} id="pdac" class={id}>
	<header class="header">
		<label>{ memory() || "" }</label>
		<label>{ $info.hostname || "" }</label>
		<label>{ connection().ssid || "" } { connection().quality || "" }</label>
	</header>
	<Group>
		{#if id === 'pdac-home'}
			<MainMenu />
		{:else}
			<Element>
				<a href={back()}>Back</a>
			</Element>
		{/if}
		{#if id === 'pdac-network'}
			<NetworkMenu {page} {data} />
		{/if}
		{#if id === 'pdac-network-list'}
			<NetworkList {page} {data} />
		{/if}
		{#if id === 'pdac-network-connect'}
			<NetworkConnect {page} {data} />
		{/if}

		{#if id === 'pdac-files' }
			<Files {page} {data} />
		{/if}


		{#if id === 'pdac-session' }
			<SessionsList {page} {data} />
		{/if}


		{#if id === 'pdac-session-id' }
			<h1> Session By Id </h1>
		{/if}
	</Group>
</div>

<style lang="sass" global>

	$width: 320px
	$height: 240px
	$topbar: 15px
	#pdac
		margin: 0 auto
		width: $width
		height: $height
		overflow: auto
		position: relative
		border: 2px solid black
		box-sizing: border-box
		background: #111
		color: white
		padding-top: $topbar
		a
			text-decoration: none
			display: flex
			flex-grow: 1
			align-items: center
			justify-content: left
			&:focus
				background: rgba(255,255,255,0.2)
		.aui-el
			padding: 5px
			border: none
			border-bottom: 1px solid black
			a
				padding: 5px
		.aui-el-button
			button
				border: 1px solid white
				color: white
				border-radius: 5px
		.header
			position: fixed
			width: $width - 20px
			height: $topbar
			transform: translate( -50%, 0% )
			padding: 0 10px
			top: 0
			left: 50%
			display: flex
			justify-content: space-between
			background-color: rgba(0,0,0,0.9)
			color: white
			font-size: 9px
			z-index: 99
			label
				display: flex

		*
			user-select: none
		&.pdac-menu > .aui-group
			min-height: calc( 100% - #{$topbar} )

</style>



<!-- <span>{JSON.stringify(data)}</span> -->