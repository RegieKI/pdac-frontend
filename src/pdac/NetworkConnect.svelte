<script>

	import { Any, Boolean, Group, Text, Defines as d } from '../svelte-aui/src/index.js'
	import { POST, GET } from '../helpers/Utils.js'
	import { info } from './Store.js'
	export let page = {};
	export let data = {};

	import { onMount } from 'svelte'
	let key = 'default'
	let text = "";
	let InputEl;

    String.prototype.splice = function(start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };

	const keys = {
		default: [
			['q','w','e','r','t','y','u','i','o','p'],
			['a','s','d','f','g','h','j','k','l'],
			['⇧','z','x','c','v','b','n','m','⌫'],
			['123','space','↵']
		],
		uppercase: [
			['Q','W','E','R','T','Y','U','I','O','P'],
			['A','S','D','F','G','H','J','K','L'],
			['⇪','Z','X','C','V','B','N','M','⌫'],
			['123','space','↵']
		],
		numbers: [
			['1','2','3','4','5','6','7','8','9','0'],
			['-','/',':',';','(',')','$','&','@','"'],
			['#+=','.',',','?','!','\'','⌫'],
			['ABC','space','↵']
		],
		symbols: [
			['[',']','{','}','#','%','^','*','+','='],
			['_','\'','|','~','<','>','€','&','@','"'],
			['123','.',',','?','!','\'','⌫'],
			['ABC','space','↵']
		]
	}


	function Status( code, status, message ){
		return {
			code, 
			status,
			message
		}
	}

	let status = Status( 0, 0, 0);
	let position = 0;
	let TextInput = {
		variant: "text", 
		placeholder: `Enter password for ${page.query.ssid}`,
		value: "",
		currPos : 0
	}
	function addChar( char ) {

		TextInput.value = TextInput.value.splice( TextInput.currPos++ , 0, char );
		// console.log('ADD CHAR');
	}

	function updateCaretPos( ) {
		// console.log('UPDATE CARET', InputEl.selectionStart)
		TextInput.currPos = InputEl.selectionStart;
	}

	async function submitPassword() {
		console.log('Attempting connect...');

		const r = await POST( `/network/connect.json?ssid=${page.query.ssid}`, { password: TextInput.value });
		if (r.status !== 200) status = Status( r.status, "Could not connect", r.statusText );
		r.status = Status( 200, "Success!", `Connected to ${page.query.ssid}`);
	}

	
</script>

<style lang="sass">
	@import '../svelte-aui/src/Utils'
	.keyboard
		+fix
		+top-left( 240px, 50% )
		+width-height(320px, auto)
		+translate( -50%, -100% )
		.row
			display: flex
		button
			flex-grow: 1
			+reset-webkit
			border: 1px solid white
			background: transparent
			border-radius: 3px
			margin: 2px
			padding: 0.4em 0em
	input
		background: transparent
</style>

<div class="status status-{status}">
	<Text 
		bind:a={TextInput}
		bind:InputEl={InputEl} 
		on:click={updateCaretPos} 
		on:focus={updateCaretPos} 
		on:input={updateCaretPos} 
		on:keydown={updateCaretPos}  />
	<div class="keyboard">
		{#each keys[key] as line }
			<div class="row">
				{#each line as char}
					{#if char === 'space'}
						<button 
							class={'key key-'+char} 
							on:click={ e => addChar(char)} 
							style="width: 40%">
							{char}
						</button>
					{:else if char === '⇧'}
						<button 
							class={'key key-'+char} 
							on:click={ e => key = 'uppercase'}>
							{char}
						</button>
					{:else if char === '⇪'}
						<button 
							class={'key key-'+char} 
							on:click={ e => key = 'default'}>
							{char}
						</button>
					{:else if char === '123'}
						<button 
							class={'key key-'+char} 
							on:click={ e => key = 'numbers'}>
							{char}
						</button>
					{:else if char === 'ABC' }
						<button 
							class={'key key-'+char} 
							on:click={ e => key = 'default'}>
							{char}
						</button>
					{:else if char === '#+=' }
						<button 
							class={'key key-'+char} 
							on:click={ e => key = 'symbols'}>
							{char}
						</button>
					{:else if char === '↵' }
						<button 
							class={'key key-'+char} 
							on:click={ e => submitPassword() }>
							{char}
						</button>
					{:else }
						<button 
							class={'key key-'+char}
							on:click={ e => addChar(char)} >
							{char}
						</button>
					{/if}
				{/each}
			</div>
		{/each}
	</div>

</div>