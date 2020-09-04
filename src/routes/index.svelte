<script>

  import axios from 'axios'
  import { Any, Group, Button, Row } from '../svelte-aui/src/index.js'
  

  function reboot() {
    console.log('[MainMenu] 🖥  rebooting...');
    axios.post('/reboot?as=json', {}).then( res => {
      console.log('[MainMenu] ✅🖥  reboot', res);
    }).catch( err => {
      console.log('[MainMenu] ❌🖥  reboot', err);
    })

  }

  function shutdown() {
    console.log('[MainMenu] 🖥  shutting down...')
    axios.post('/shutdown?as=json', {}).then( res => {
      console.log('[MainMenu] ✅🖥  shutdown', res);
    }).catch( err => {
      console.log('[MainMenu] ❌🖥  shutdown', err);
    })
  }
</script>

<style lang="sass">
  .link a
    /*display: block*/
</style>

<Any><a rel="prefetch" href="/session">Sessions</a></Any>
<Any><a rel="prefetch" href="/sync">Sync</a></Any>
<Any><a rel="prefetch" href="/network">WLAN</a></Any>
<!-- <Any><a rel="prefetch" href="/camera">Camera</a></Any> -->
<Any><a rel="prefetch" href="/system">System</a></Any>