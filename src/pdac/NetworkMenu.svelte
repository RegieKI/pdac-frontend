<script>

	import Back from './Back.svelte'
	import { Button } from '../svelte-aui/src/index.js'
	import { info } from './Store.js'
	export let page = {};
	export let data = {};
	
</script>

<Back {page} />
{#if $info}
  <div>
    WLAN: { ($info.wlan0.ssid) ? $info.wlan0.ssid : 'NONE' }
    <br />
    USB: {data.ssid ? data.ssid : 'NONE'} 
  </div>
  {#if data.ssid}
    <Button><a href="/network/connect?ssid={data.ssid}&psk={data.psk}">Connect Automatically</a></Button>
  {/if}
  <Button><a href="/network/list">Connect Manually</a></Button>
{/if}