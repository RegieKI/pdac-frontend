
<script>

  // js modules...

  import { onMount, setContext, onDestroy } from 'svelte'
  import { goto } from '@sapper/app'
  import axios from 'axios'
  import cssVars from 'svelte-css-vars'

  // pdac modules...

  import Colors from './db.colors.js'
  import MiBands from './db.mibands.js'
  import { info, overlay, konsole, backend, eyeball } from './stores.js'

  // helpers modules...

  import { Memory, Strip, Back } from 'svelte-touch-os/src/index.js'
  import { Any, Group, AUI, Column, Button } from 'svelte-aui/src/index.js'

  // material icons...

  import Wifi from "svelte-material-icons/Wifi.svelte";
  import Brain from "svelte-material-icons/Brain.svelte";
  import TemperatureCelsius from "svelte-material-icons/TemperatureCelsius.svelte";
  import WifiStrengthOffOutline from "svelte-material-icons/WifiStrengthOffOutline.svelte";
  import Sleep from "svelte-material-icons/Sleep.svelte";
  import WatchVariant from "svelte-material-icons/WatchVariant.svelte";

  import { API_ERROR, API_SUCCESS, API_TRY, API_VIZ } from './types.js'

  let ws;
  let maxLines = 120
  let PdacEl;

  import { stores } from '@sapper/app';
  const { page } = stores();


  onMount( async() => {

      console.log('[_layout.svelte] 📦 mounted');
      page.subscribe(({ path, params, query }) => {

        console.log('[_layout.svelte] 📄 page changed : subscribe', path);
        info.grab().then( r => {

          if (process.browser && !ws) {
            const url = `ws://${$info.hostname}.local:8765`
            console.log('[overview.svelte] 👁 ⚡️  opening websocket...', url)
            ws = new WebSocket(url);
            ws.addEventListener('open', onOpen)
            ws.addEventListener('message', onMessage)
            ws.addEventListener('error', onError)
          }
        })
      })

  });

  onDestroy( async() => {

    if (process.browser && ws) {
      console.log('[overview.svelte] 👁 🛑  closing websocket...')
      ws.close()
    }
  });

  function appendToKonsole( str ) {

    try {
      const j = JSON.parse( str )
      konsole.update( k => {
        k.unshift( { timestamp: j.timestamp || '~', type: j.type || '~', message: j.message || '~', title: j.title || '~' } )
        while (k.length > maxLines) k.slice(1)
        return k
      })
      if ( j.type == API_VIZ || j.type == "viz" || j.type == "visual" ) {
        console.log('[overview.svelte] 👁 👁 👁  setting visual:', j.title, j.message);
        eyeball.update( e => {
          e.title = j.title
          e.message = j.message
          return e
        })

      }
      console.log('[overview.svelte] 👁 ✨ ✅  parsed socket message:', $konsole.length, $konsole, $page.path);
      backend.update( b => { 
        b = j.config
        return b
      })
    } catch( err ) {
      console.log('[overview.svelte] 👁 ✨ ❌  error parsing message:', err.message);

    }
  }

  function onOpen(e) {
    console.log('[overview.svelte] 👁 ✅  opened websocket...', e.currentTarget.url);
  }
  function onError(err) {
    console.log('[overview.svelte] 👁 ❌  opened websocket...', err);
  }

  function onMessage(e) {
    console.log('[overview.svelte] 👁 ✨  received websocket message...', e.data);
    appendToKonsole( e.data )
  }

  $: color = Colors.find( c => Strip(c.hostname) === Strip($info.hostname) ) || Colors[ parseInt( Math.random() * (Colors.length - 1) ) ];
  $: information = $info || {}
  $: infoBackend = information.backend || {}
  $: macAddress = infoBackend.mac_address
  $: wlan = information.wlan0 || {}
  $: ip = information.ip
  $: miband = MiBands.find( c => Strip(c.mac_address) === Strip(infoBackend.mac_address) ) || {};



  $: isPi = (process.browser) ? navigator.appVersion.indexOf('Linux armv7l') !== -1 : false;
  $: backgroundColor = `background-color: var(--${ ($info) ? $info.hostname : 'grey-900' } )`


</script>

<svelte:head>
  <title>PDAC</title>
</svelte:head>

<style lang="sass" global>
@import '../styles/app'
</style>

<svelte:window  />
<main> 
  <div bind:this={PdacEl}  id="pdac" class={`aui  ${ (isPi) ? 'hide-cursor' : ''} bg-${ color ? color.color : 'null' }  txt-${ color ? color.text_color : 'null' }`}>
    <header class="header" on:click={ () => window.location.reload() } >
      {#if $info }
        <label>
          <Brain />&nbsp;
          { Memory($info.freemem).auto || "~" }&nbsp;
          {$info.temperature || "~"} 
          <TemperatureCelsius /> 
        </label>
        <label>
          { information.hostname || "~" }&nbsp;

          {#if miband.number }
            <WatchVariant />
          {:else}
            <Sleep />
          {/if}
          &nbsp;{ miband.number || "~" }
        </label>
        <label>
          {#if wlan.ssid} 
            <Wifi /> 
          {:else} 
            <WifiStrengthOffOutline /> 
          {/if}
          &nbsp;{ wlan.ssid || ip }
        </label>
      {/if}
    </header>

    {#if $overlay}
      <div class="overlay" >
        <Column a={{grow: true}} >
          {#if $overlay.type === 'wait'}
          <div class="justify-center">
            <div class="spinner">
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          {/if}
          {#if $overlay.type === 'error'}
            <div style="align-items:center">
              Status: {$overlay.status}
              <br />
              Message: {@html $overlay.message}
            </div>
          {:else}
            <div style="align-items:center">{@html $overlay.message}</div>
          {/if}

          {#if $overlay.actions}
            {#each $overlay.actions as a }
              <Button a={{grow: true}} style="width:100%" on:click={ e => overlay.set(null) }><a href={a[1]}>{a[0]}</a></Button>
            {/each}
          {/if}
          {#if $overlay.type === 'error' || $overlay.refresh}
            <Button a={{grow: true}} style="width:100%" on:click={ e => { window.location = window.location } }>{ $overlay.refresh || "Refresh" }</Button>
          {/if}
          {#if $overlay.type === 'error' || $overlay.close} 
            <Button a={{grow: true}} style="width:100%" on:click={ e => overlay.set(null) }>{ $overlay.close || "Close" }</Button>
          {/if} 
        </Column>
      </div>
    {/if}

    <div class="container">
      <Column a={{grow: true}} className="pdac-main-column">
        <slot />
      </Column>
    </div>
  </div>
</main>

