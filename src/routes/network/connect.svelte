<script context="module">
  import { AutoPreload } from './../../helpers/Utils.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>

<script>

  import axios from 'axios'
  import { stores } from '@sapper/app';
  const { page } = stores();
  import { goto } from '@sapper/app'
  import { onMount } from 'svelte'
  import { info, overlay } from './../stores.js'
  import Back from './../../helpers/Back.svelte'
  import Keyboard from '../../helpers/Keyboard.svelte'
  import { Any, Boolean, Group, Text, Defines as d } from 'svelte-aui/src/index.js'

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
<Keyboard placeholder={placeholder} text={text} on:submit={submitPassword} />
