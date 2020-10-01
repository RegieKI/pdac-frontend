<script>
  import { createEventDispatcher } from 'svelte';
  import { Any, Boolean, Group, Text, Defines as d } from 'svelte-aui/src/index.js'
  export let page = {};
  export let data = {};

  const dispatch = createEventDispatcher();
  import { onMount } from 'svelte'

  let key = 'default'
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

  export let placeholder = "Enter text";
  export let text = "fsdfsd";

  let input = {
    variant: "text", 
    placeholder: placeholder,
    value: text,
    currPos : 0
  }


  onMount( async() => {
    console.log('INPUT', input, text)
  });

  function addChar( char ) {
    input.value = input.value.splice( input.currPos++ , 0, char );
  }

  function removeChar( char ) {

    let a = input.value;
    let b = input.value;
    const i = input.currPos;
    a = a.slice( 0, i - 1 );
    b = b.slice( i );

    console.log('REMOVE', i , a, b);
    input.value = a + b;
    if (input.currPos > 1) input.currPos -= 1;
  }

  function updateCaretPos( ) {
    input.currPos = InputEl.selectionStart;
  }

  async function submit() {
    console.log('[Keyboard] 🎹  keyboard entered:', input.value);
    dispatch( 'submit', input.value );
  }

  
</script>

<style lang="sass">
  @import 'svelte-aui/src/styles/mixins'
  .keyboard
    flex-basis: 120px
    .row
      display: flex
    button
      flex-grow: 1
      +reset-webkit
      border: 1px solid white
      background: transparent
      border-radius: 0px
      margin: 0px
      padding: 0.4em 0em
  input
    background: transparent
</style>
<Text 
  bind:a={input}
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
            on:click={ e => addChar(' ')} 
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
            on:click={ e => submit() }>
            {char}
          </button>
        {:else if char === '⌫' }
          <button 
            class={'key key-'+char} 
            on:click={ e => removeChar() }>
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
