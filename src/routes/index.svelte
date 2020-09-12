<script>

  import { onMount } from 'svelte'
  import axios from 'axios'
  import { Any, Group, Button, Row } from '../svelte-aui/src/index.js'
  import { info, overlay } from './stores.js'
  import { stores } from '@sapper/app';
  const { page } = stores();
  
  let waitMsg = "Waiting for Backend"; 
  onMount( async() => {
    console.log('[/:index.svelte] 📊 onMount main menu...')
    await info.grab();
    if (!$info.backend.active) {
      console.log('[/:index.svelte] ℹ❌ no backend, looping...')
      overlay.set({type: "wait", message: waitMsg, close: "Skip"}) 
      setTimeout( loopUntilBackend, 3000);
    } else if ( !$info.wlan0.ssid && ( $page.path == "/" || $page.path == "" )  ) {

      axios.get( '/ping?as=json' ).then( () => {
        console.log('[/:index.svelte] 🐇✅ directus successfully pinged');
      }).catch( () => {
        overlay.set({type: "wlan", message: "Could not connect to API", close: "Skip", actions: [ ['Setup WLAN', '/network'] ]})
      })
    }

  });

  // preload data...

  async function loopUntilBackend() {

    await info.grab();

    if (!$info.backend.active) {
      if ($overlay.type == "wait" && $overlay.message == waitMsg) {
        console.log('[/:index.svelte] ℹ️⭕️ retrying for backend in 3 seconds')
        setTimeout( loopUntilBackend, 3000);
      } else {
        console.log('[/:index.svelte] ℹ️✅ cancelled wait for backend')
      }
    } else {
      overlay.set( undefined )
    }
  }

</script>

<style lang="sass">
  .link a
    /*display: block*/
</style>

<Any><a rel="prefetch" href="/session">Sessions</a></Any>
<Any><a rel="prefetch" href="/sync">Sync</a></Any>
<Any><a rel="prefetch" href="/network">WLAN</a></Any>
<Any><a rel="prefetch" href="/system">System</a></Any>