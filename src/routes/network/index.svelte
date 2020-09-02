<script context="module">
  import { AutoPreload } from './../../helpers/Utils.js'
  export async function preload( page, session ) {  return AutoPreload(page, session, this) }
</script>

<script>
  import { info } from '../stores.js'
  import { Button } from '../../svelte-aui/src/index.js'
  import Back from './../../helpers/Back.svelte'
  export let data;
  
</script>

<Back />
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