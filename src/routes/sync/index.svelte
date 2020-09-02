<script>

  import axios from 'axios'
  import { onMount } from 'svelte'
  import { Button, Row } from '../../svelte-aui/src/index.js'
  import Back from './../../helpers/Back.svelte'
  import { info, overlay } from './../stores.js'
  import CheckAll from "svelte-material-icons/CheckAll.svelte";
  
  export let data = {};

  function checkAll() {

    return new Promise( (resolve, reject) => {
      overlay.set( { type: 'wait', message: 'Checking Drive...' } )
      axios.get('/sync?as=json', {}).then( (res) => {
        data = res.data;
        overlay.set( null )
        resolve();
      }).catch( err => {
        overlay.set( { type: 'error', ...err.response.data } )
        reject();
      });

    })
  }


  onMount( async() => {
    checkAll();
  });

  function syncAll() {
    overlay.set( { type: 'wait', message: 'Syncing Files<br />Please wait...' } )
    axios.post('/sync?as=json', {}).then( (res) => {

      checkAll().finally( () => {

        overlay.set( { 
          type: 'success',
          message: res.data, 
          actions: [
            ['Sessions', '/session'],
            ['Close', '/sync'],
        ]});
      });
    }).catch( err => {
      overlay.set( { type: 'error', ...err.response.data } )
    });
  }
  
</script>

<Back />
<div>
Synced Files: {data.matching_files || 'None'}<br />
Unsynced Files: {data.differences_found || 'None'} ({data.files_missing || 'None'}) <br />
Flags: {data.errors_while_checking || 'None'}
</div>
{#if !data.differences_found }
  <div  style="font-size:2em;justify-content: center;align-items: center"><CheckAll /></div>
{:else}
  <Button on:click={syncAll} >Sync All</Button> 
{/if}