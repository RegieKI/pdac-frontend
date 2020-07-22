
<script>
	import cssVars from 'svelte-css-vars'
	import { Utils } from '../svelte-aui/src/index.js'
	export let strength = 0;
	export let size = 22;

	const fade = 0.5;
	$: sig4 = (strength > 72) ? 1 : fade;
	$: sig3 = (strength > 50) ? 1 : fade;
	$: sig2 = (strength > 25) ? 1 : fade;
	$: sig1 = (strength > 0) ? 1 : fade;

	// $: arseInt( Utils.Scale(strength, 0, 100, 1, 4, true) )}`;
</script>

<style>

</style>
<svg version="1.1"
	id="wifi"
	xmlns="http://www.w3.org/2000/svg"
	x="0px" y="0px"
  	width="{size}px" height="{size*0.6666666}px"
	viewBox="4 4 16 16">

	<path id="wifi3" fill="#FFFFFF" fill-opacity={sig4} d="M9.9,5C6.8,5,4,6.4,2.2,8.7l1.1,1.1c1.6-2,4-3.2,6.7-3.2c2.7,0,5.1,1.3,6.7,3.2l1.1-1.1
		C15.8,6.4,13,5,9.9,5z">
	</path>
	<path id="wifi2" fill="#FFFFFF" fill-opacity={sig3} d="M9.9,8c-2.3,0-4.3,1.1-5.6,2.8l1.1,1.1c1-1.4,2.6-2.4,4.5-2.4c1.9,0,3.5,0.9,4.5,2.4l1.1-1.1
		C14.2,9.1,12.2,8,9.9,8z">
	</path>
	<path id="wifi1" fill="#FFFFFF" fill-opacity={sig2} d="M9.9,11c-1.5,0-2.7,0.8-3.4,2l1.1,1.1c0.4-0.9,1.3-1.6,2.3-1.6s2,0.7,2.3,1.6l1.1-1.1
		C12.6,11.8,11.4,11,9.9,11z">
	</path>
	<circle id="dot" fill="#FFFFFF" fill-opacity={sig1} cx="9.9" cy="15.3" r="1">
	</circle>
</svg>