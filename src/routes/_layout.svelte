
<script>

  // js modules...

  import { onMount, setContext } from 'svelte'
  import { goto } from '@sapper/app'
  import axios from 'axios'
  import cssVars from 'svelte-css-vars'

  // pdac modules...

  import Colors from './db.colors.js'
  import MiBands from './db.mibands.js'
  import { info, overlay } from './stores.js'

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

  let PdacEl;

  import { stores } from '@sapper/app';
  const { page } = stores();


  onMount( async() => {

    // if (typeof window !== "undefined" && typeof document !== "undefined") {
      console.log('[_layout.svelte] 📦 mounted');
      // await info.grab();
      page.subscribe(({ path, params, query }) => {

        console.log('[_layout.svelte] 📄 page changed : subscribe', path);
        info.grab();
      })
    // }
  });


  $: color = ($info) ?  Colors.find( c => Strip(c.hostname) === Strip($info.hostname) ) : undefined;
  $: miband = ($info) ?  MiBands.find( c => Strip(c.mac_address) === Strip($info.backend.mac_address) ) : undefined;



  $: isPi = (process.browser) ? navigator.appVersion.indexOf('Linux armv7l') !== -1 : false;
  $: backgroundColor = `background-color: var(--${ ($info) ? $info.hostname : 'grey-900' } )`


</script>

<svelte:head>
  <title>PDAC</title>
</svelte:head>

<style lang="sass" global>
@import '../styles'
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
          { $info.hostname || "~" }&nbsp;

          {#if $info.backend.miband.connected}
            <WatchVariant />
          {:else}
            <Sleep />
          {/if}
          &nbsp;{ miband ? miband.number : "~" }</label>
        <label>
          <!-- {#if $info.wlan0.ssid} <WatchVariant /> {:else} <WatchVariantOff /> {/if} -->
          {#if $info.wlan0.ssid} <Wifi /> {:else} <WifiStrengthOffOutline /> {/if}  
          &nbsp;{$info.wlan0.ssid || ''}
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
              <Button on:click={ e => overlay.set(null) }><a href={a[1]}>{a[0]}</a></Button>
            {/each}
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
        <slot />
      </Column>
    </div>
  </div>
</main>

