<script context="module">
  import { AutoPreload } from 'svelte-touch-os/src/index.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>

<script>

  import axios from 'axios'
  import { stores } from '@sapper/app';
  const { page } = stores();
  import { goto } from '@sapper/app'
  import { onMount } from 'svelte'
  import { info, overlay } from './../stores.js'
  import { Back, Keyboard } from 'svelte-touch-os/src/index.js'
  import { Any, Boolean, Group, Text, Column, Defines as d } from 'svelte-aui/src/index.js'

  export let data;

  let placeholder = `Password for ${$page.query.ssid}`;
  let text = $page.query.psk || "";


  onMount( async() => {
    console.log(placeholder, text)
  });

  async function submitPassword(e, v) {
    console.log('[NetworkConnect] 🌐  attempting connection to:', e, v, e.detail)
    overlay.set( { type: 'wait', message: 'Connecting to ' + $page.query.ssid } )
    axios.post( `/network/connect?as=json`, {
      ssid: $page.query.ssid, 
      psk: e.detail
    }).then( res => {
      console.log('[NetworkConnect] ✅🌐  successfully connected:', res);
      goto( '/' );
      overlay.set(null);
    }).catch( err => {
      console.log('[NetworkConnect] ❌🌐  errpr connecting:', err);
      overlay.set( {type: 'error', message: 'Could not connect', status: 403});
    });
  }

  
</script>

<style lang="sass">
</style>
<Back />
<Column className="mlr06 keyboard-wrapper" a={{grow: true}}>
  <Keyboard placeholder={placeholder} text={text} on:submit={submitPassword} />
</Column>