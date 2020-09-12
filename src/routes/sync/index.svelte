<script>

  import axios from 'axios'
  import { onMount } from 'svelte'
  import { Button, Row } from 'svelte-aui/src/index.js'
  import Back from './../../helpers/Back.svelte'
  import { Memory } from './../../helpers/Utils.js'
  import { info, overlay } from './../stores.js'
  import CheckAll from "svelte-material-icons/CheckAll.svelte";
  
  export let data = {};
  let local = [];

  let allowDanger = false;

  function checkAll() {

    return new Promise( (resolve, reject) => {
      overlay.set( { type: 'wait', message: 'Checking Drive' } )
      axios.get('/sync?as=json', {}).then( (res) => {
        data = res.data;
        overlay.set( null )
        resolve();
      	axios.get('/usb/recordings?as=json').then( (res) => {
      		local = res.data;
      		console.log('[sync/index.svelte] 🗄✅  listed local files:', local.length);
      		allowDanger = true;
      	}).catch( (err) => {

      		console.log('[sync/index.svelte] 🗄❌  could not list local files:', err);
      	});
      }).catch( err => {
        overlay.set( { type: 'error', ...err.response.data } )
        reject();
      });

    })
  }

  $: usb = $info.drives.find( d => d._mounted == "/home/pi/pdac/usb") || {};
  $: used = Memory( usb._used * 1000 ).auto + ' (' + usb._capacity + ')';
  $: available = Memory( usb._available * 1000 ).auto;


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

  function clearUp() {


    overlay.set( { type: 'wait', message: 'Deleting Local Files' } );


	    axios.post('/sync/clearup?as=json', {}).then( (res) => {
	    	console.log(res);
			setTimeout( () => {
				checkAll().finally( () => { overlay.set( null ); });
			}, 1000);
	    }).catch( err => {
	      overlay.set( { type: 'error', ...err.response.data } )
	    });
  }
  
</script>

<Back />
<div style="margin: 0em 0em 0.5em 0em">
Used Memory: {used}<br />
Available Memory: {available}<br />
Synced Files: {data.matching_files || 'None'}<br />
Unsynced Files: {data.differences_found || 'None'} ({data.files_missing || 'None'}) <br />
Local Files: { (!local) ? 'N/A' : local.length }<br /> 
Notices: {data.errors_while_checking || 'None'}
</div>
{#if !data.differences_found && !data.errors_while_checking && allowDanger && !data.files_missing && local.length != 0 }
  <Button on:click={clearUp} >Clear Space</Button> 
{:else if local.length != 0 }
  <Button on:click={syncAll} >Sync All</Button> 
{:else}
	<div style="margin: 1em 0em">Nothing to Sync.</div>
{/if}