<script>


	import Colors from './Colors.js'
	import MiBands from './MiBands.js'

	import cssVars from 'svelte-css-vars'
  import Wifi from "svelte-material-icons/Wifi.svelte";
  import Brain from "svelte-material-icons/Brain.svelte";
  import TemperatureCelsius from "svelte-material-icons/TemperatureCelsius.svelte";
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
	import System from './System.svelte'
	import Hostname from './Hostname.svelte'
	import MainMenu from './MainMenu.svelte'
	import Camera from './Camera.svelte'
	import Preview from './Preview.svelte'
	import Back from './Back.svelte'
	import { info, overlay } from './Store.js'

	export let page = {};
	export let data = null;
	let PdacEl;


	let waitMsg = "Waiting for backend";
	async function grabInfo() {


		await info.grab();
		if (!$info.backend.active) {
			if ($overlay.type == "wait" && $overlay.message == waitMsg) {
				console.log('[PDAC] ℹ️ retrying for backend in 3 seconds')
				setTimeout( grabInfo, 3000);
			} else {
				console.log('[PDAC] ℹ️ cancelled wait for backend')
			}
		} else {
			overlay.set(null)
		}
	}

	function strip(str) {
		return str.replace(/(\r\n|\n|\r)/gm, "").trim()
	}


	$: color = ($info) ?  Colors.find( c => strip(c.hostname) === strip($info.hostname) ) : undefined;
	$: miband = ($info) ?  MiBands.find( c => strip(c.mac_address) === strip($info.backend.mac_address) ) : undefined;


	onMount( async() => {
		console.log('[PDAC] ℹ️ grabbing infomation')
		await info.grab();
		if (!$info.backend.active) overlay.set({type: "wait", message: waitMsg, close: "Skip"})

	MiBands.find( c => {
		console.log('...' + strip(c.mac_address) + '...' + strip($info.backend.mac_address) + '...' )
		console.log('...' + strip(c.mac_address).length + '...' + strip($info.backend.mac_address).length + '...' )
		console.log(strip(c.mac_address) === strip($info.backend.mac_address) )
	});
		setTimeout( grabInfo, 3000);
	});


	$: isPi = (process.browser) ? navigator.appVersion.indexOf('Linux armv7l') !== -1 : false;

	$: id = ( page.path !== '/') ? 'pdac' + page.path.replace(/\//g, '-') : 'pdac-home';

	$: backgroundColor = `background-color: var(--${ ($info) ? $info.hostname : 'grey-900' } )`


</script>

<svelte:head>
	<title>PDAC</title>
</svelte:head>

<style lang="sass" global>
@import '../styles'
</style>
<!-- 
	on:mousedown={onMousedown}
	on:mousemove={onMousemove}
	on:mouseup={onMouseup}
	on:mousedrag={onMouseDrag} -->
<svelte:window
	/>
<div bind:this={PdacEl}  id="pdac" class={`aui  ${id} ${ (isPi) ? 'hide-cursor' : ''} bg-${ color ? color.color : 'null' }  txt-${ color ? color.text_color : 'null' }`}>
	<header class="header" >
		{#if $info }
			<label><Brain />  { Memory($info.freemem).auto }  {$info.temperature} <TemperatureCelsius /> </label>
			<label>{ $info.hostname || "" } ({ miband ? miband.number : "~" })</label>
			<label>
				<!-- {#if $info.wlan0.ssid} <WatchVibrate /> {:else} <WatchVibrateOff /> {/if} -->
				{#if $info.wlan0.ssid} <Wifi /> {:else} <WifiStrengthOffOutline /> {/if}  
				{$info.wlan0.ssid || ''}
			</label>
		{/if}
	</header>

	{#if $overlay}
		<div class="overlay" >
			<Column a={{stretch: true}} >
				{#if $overlay.type === 'wait'}
				<div>
					<div class="spinner">
						<span />
						<span />
						<span />
						<span />
					</div>
				</div>

				{/if}
				{#if $overlay.type === 'error'}
					<div>
						Status: {$overlay.status}
						<br />
						Message: {$overlay.message}
					</div>
				{:else}
					<div>{$overlay.message}</div>
				{/if}

				{#if $overlay.type === 'error' || $overlay.refresh}
					<Button on:click={ e => { window.location = window.location } }>{ $overlay.refresh || "Refresh" }</Button>
				{/if}
				{#if $overlay.type === 'error' || $overlay.close}
					<Button on:click={ e => overlay.set(null) }>{ $overlay.close || "Close" }</Button>
				{/if} 
			</Column>
		</div>
	{/if}

	<div class="container">
		<Column a={{stretch: true}} className="pdac-main-column">
			<!-- main menu -->

			{#if id === 'pdac-home'}
				<MainMenu />

			<!-- network overview -->

			{:else if id === 'pdac-network'}
				<NetworkMenu {page} {data} />

			<!-- network list -->

			{:else if id === 'pdac-network-list'}
				<NetworkList {page} {data} />

			<!-- network connect -->

			{:else if id === 'pdac-network-connect'}
				<NetworkConnect {page} {data} />

			<!-- system -->

			{:else if id === 'pdac-system'}
				<System {page} {data} />

			<!-- view usb -->

			{:else if id.indexOf( 'pdac-usb' ) !== -1 }
				<Files {page} {data} />

			<!-- session -->

			{:else if id === 'pdac-session' }
				<SessionsList {page} {data} />

			<!-- session exercise -->

			{:else if id.indexOf('pdac-session-') !== -1 }
				<Session {page} {data} />

			<!-- hostname -->

			{:else if id === 'pdac-hostname' }
				<Hostname {page} {data} />

			<!-- camera -->

			{:else if id === 'pdac-camera' }
				<Camera {page} {data} />

			<!-- camera preview -->

			{:else if id === 'pdac-camera-preview' }
				<Preview {page} {data} />


			{:else}

				<Back />
			{/if}
			<slot />
		</Column>
	</div>
</div>



<!-- <span>{JSON.stringify(data)}</span> -->