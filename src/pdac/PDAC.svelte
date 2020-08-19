<script>


  import Wifi from "svelte-material-icons/Wifi.svelte";
  import WifiStrengthOffOutline from "svelte-material-icons/WifiStrengthOffOutline.svelte";
  import WatchVibrate from "svelte-material-icons/WatchVibrate.svelte";
  import WatchVibrateOff from "svelte-material-icons/WatchVibrateOff.svelte";

	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte'
	import { Memory } from '../helpers/Utils.js'
	import { goto } from '@sapper/app'
	
	import axios from 'axios'
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

	import { info, overlay } from './Store.js'

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
		console.log('[PDAC] ℹ️ grabbing infomation')
		await info.grab();

		axios.get('/network/status?as=json').then( res => {
			console.log('STATUS', res.data.wpa_state);
			if (res.data.wpa_state == 'INACTIVE') {
				goto('/network');
			}
		}).catch(err => {

		});

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
<div bind:this={PdacEl} on:mousedown={onMousedown} id="pdac" class={`aui  ${id} ${(isPi) ? 'hide-cursor' : ''}`}>
	<header class="header">
		{#if $info }
			<label>{ Memory($info.freemem).auto } ({ Memory($info.usedmem).auto }/{ Memory($info.totalmem).auto })</label>
			<label>{ $info.hostname || "" }</label>
			<label>
				<WatchVibrate />
				<WatchVibrateOff />
				{$info.wlan0.ssid || ''}
				<Wifi />
				<WifiStrengthOffOutline />
			</label>
		{/if}
	</header>

	{#if $overlay}
		<div class="overlay">
			<Column a={{stretch: true}} >
				<!-- <span>{ JSON.stringify($overlay) }</span> -->
				{#if $overlay.type === 'error'}
					<div>
						Status: {$overlay.status}
						<br />
						Message: {$overlay.message}
					</div>
					<Button on:click={ e => { window.location = window.location } }>Refresh</Button>
					<Button on:click={ e => overlay.set(null) }>Close</Button>
				{:else}
					<div>{$overlay.message}</div>
				{/if}
			</Column>
		</div>
	{/if}

	<div class="container">
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

			<!-- view usb -->

			{#if id.indexOf( 'pdac-usb' ) !== -1 }
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
@import '../styles'
</style>



<!-- <span>{JSON.stringify(data)}</span> -->