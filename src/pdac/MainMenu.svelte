<script>

  import AccountBox from "svelte-material-icons/AccountBox.svelte";
  import UsbFlashDrive from "svelte-material-icons/UsbFlashDrive.svelte";
  import Wrench from "svelte-material-icons/Wrench.svelte";
  import Camera from "svelte-material-icons/Camera.svelte";
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

<Any><a rel="prefetch" href="/session"><!-- <AccountBox /> -->  Sessions</a></Any>
<Any><a rel="prefetch" href="/camera"><!-- <Camera /> -->  Camera</a></Any>
<!-- <Any><a rel="prefetch" href="/usb"><UsbFlashDrive />  USB</a></Any> -->
<Any><a rel="prefetch" href="/network">WLAN</a></Any>
<Any><a rel="prefetch" href="/system"><!-- <Wrench /> -->  System</a></Any>
<!-- <Row>
	<Button on:click={reboot}>Reboot</Button>
	<Button on:click={shutdown}>Shutdown</Button>
</Row> -->