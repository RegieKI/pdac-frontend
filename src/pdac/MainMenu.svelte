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

<style>
</style>

<Any><a rel="prefetch" href="/session">Sessions</a></Any>
<Any><a rel="prefetch" href="/camera">Camera</a></Any>
<Any><a rel="prefetch" href="/usb">USB</a></Any>
<Any><a rel="prefetch" href="/network">Network</a></Any>
<Any><a rel="prefetch" href="/hostname">Hostname</a></Any>
<Any><a rel="prefetch" href="/calibrate">Calibrate</a></Any>
<Row>
	<Button on:click={reboot}>Reboot</Button>
	<Button on:click={shutdown}>Shutdown</Button>
</Row>