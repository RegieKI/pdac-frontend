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


	$: isPi = (process.browser) ? navigator.appVersion.indexOf('Linux armv7l') !== -1 : false;

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
<div bind:this={PdacEl} on:mousedown={onMousedown} id="pdac" class={`${id} ${(isPi) ? 'hide-cursor' : ''}`}>
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
	<div class="aui container">
		<Column a={{stretch: true}} className="pdac-main-column">
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
		</Column>
	</div>
</div>

<style lang="sass" global>
	/*@font-face
		font-family: 'pixel'
		src: url('/Fonts/slkscr.ttf') format('woff')*/
	$width: 100%
	$height: 100vh
	$topbar: 20px
	$fontsize: 18px 
	$smallfontsize: 10px
	#pdac
		margin: 0 auto
		width: $width
		height: $height
		overflow: auto
		position: relative
		box-sizing: border-box
		background: #111
		font-size: $fontsize
		color: white
		.pdac-main-column
			padding: 15px
			padding-top: $topbar + 15px
			padding-right: 30px
		.pdac-main-column > *
			flex-grow: 1
			min-height: 60px
		&.hide-cursor
			cursor: none!important
			*, a 
				cursor: none!important
		input, button, select
			font-size: $fontsize
			color: white
		input[type=text], input[type=password], input[type=email], select
			border: 1px solid white
		/**
			font-smooth: never!important
			-webkit-font-smoothing : none!important*/
		a
			text-decoration: none
			display: flex
			align-items: center
			justify-content: left
			min-height: 30px
			&:focus
				background: rgba(255,255,255,0.2)
		.container
			display: flex
			height: 100%
		.aui-button
			button
				border: 1px solid white
				color: white
				border-radius: 5px
				a
					justify-content: center
		.header
			position: fixed
			width: $width
			height: $topbar
			top: 0
			left: 0
			display: flex
			justify-content: space-between
			background-color: rgba(0,0,0,0.9)
			color: white
			z-index: 99
			font-size: $smallfontsize
			padding: 0 10px
			box-sizing: border-box
			line-height: $topbar
			/*font-family: pixel, monospace, sans-serif*/
			label
				display: flex

		*
			user-select: none

</style>



<!-- <span>{JSON.stringify(data)}</span> -->