<script>
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte'
	import { MEM } from '../helpers/Utils.js'


	import { Any, Group, AUI, Column, Button } from '../svelte-aui/src/index.js'
	import Files from '../helpers/Files.svelte'
	import Breadcrumb from '../helpers/Breadcrumb.svelte'
	import WLAN from '../helpers/WLAN.svelte'
	import SessionsList from './SessionsList.svelte'
	import Session from './Session.svelte'
	import NetworkList from './NetworkList.svelte'
	import NetworkMenu from './NetworkMenu.svelte'
	import NetworkConnect from './NetworkConnect.svelte'
	import Hostname from './Hostname.svelte'
	import MainMenu from './MainMenu.svelte'
	import Camera from './Camera.svelte'

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
		{#if $info.active }
			<label>{ $info.memory || "" }</label>
			<label>{ $info.hostname || "" }</label>
			<label>
				{ $info.connection.ssid || "" }
				<WLAN strength={$info.connection.quality} />
			</label>
		{/if}
	</header>
	<AUI>

		<!-- main menu -->

		{#if id === 'pdac-home'}
			<MainMenu />
		{/if}

		<!-- network overview -->

		{#if id === 'pdac-network'}
			<NetworkMenu {page} {data} />
		{/if}

		<!-- network list -->

		{#if id === 'pdac-network-list'}
			<NetworkList {page} {data} />
		{/if}

		<!-- network connect -->

		{#if id === 'pdac-network-connect'}
			<NetworkConnect {page} {data} />
		{/if}

		<!-- view recordings -->

		{#if id.indexOf( 'pdac-recordings' ) !== -1 }
			<Files {page} {data} />
		{/if}

		<!-- session -->

		{#if id === 'pdac-session' }
			<SessionsList {page} {data} />
		{/if}

		<!-- session exercise -->

		{#if id.indexOf('pdac-session-') !== -1 }
			<Session {page} {data} />
		{/if}

		<!-- hostname -->

		{#if id === 'pdac-hostname' }
			<Hostname {page} {data} />
		{/if}

		<!-- camera -->

		{#if id === 'pdac-camera' }
			<Camera {page} {data} />
		{/if}
	</AUI>
</div>

<style lang="sass" global>
	/*@font-face
		font-family: 'pixel'
		src: url('/Fonts/slkscr.ttf') format('woff')*/
	$width: 320px
	$height: 240px
	$topbar: 15px
	#pdac
		margin: 0 auto
		width: $width
		height: $height
		overflow: auto
		position: relative
		box-sizing: border-box
		background: #111
		padding: 5px
		padding-top: $topbar
		font-size: 14px
		color: white
		input, button, select
			font-size: 14px
			color: white
		input[type=text], input[type=password], input[type=email], select
			border: 1px solid white

		a
			text-decoration: none
			display: flex
			flex-grow: 1
			align-items: center
			justify-content: left
			min-height: 30px
			&:focus
				background: rgba(255,255,255,0.2)
		.aui-button
			button
				border: 1px solid white
				color: white
				border-radius: 5px
				a
					justify-content: center
		.header
			position: fixed
			width: $width - 10px
			height: $topbar
			transform: translate( -50%, 0% )
			padding: 0 5px
			top: 0
			left: 50%
			display: flex
			justify-content: space-between
			background-color: rgba(0,0,0,0.9)
			color: white
			z-index: 99
			font-size: 8px
			/*font-family: pixel, monospace, sans-serif*/
			label
				display: flex

		*
			user-select: none
		&.pdac-home > .aui
			min-height: calc( 100% - #{$topbar} )

</style>



<!-- <span>{JSON.stringify(data)}</span> -->