<script context="module">
  import { AutoPreload }  from 'svelte-touch-os/src/index.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>
<script>

  import axios from 'axios'
  import { onMount } from 'svelte'
  import { goto } from '@sapper/app';


  // icons...

  import ArrowLeft from "svelte-material-icons/ArrowLeft.svelte";
  import Check from "svelte-material-icons/Check.svelte";
  import Microphone from "svelte-material-icons/Microphone.svelte";
  import Camera from "svelte-material-icons/Camera.svelte";

  // stores...

  import { info, overlay } from './../../stores.js'
  import { stores } from '@sapper/app';
  const { page } = stores();

  // helpers...

  import { Back, WebCam, AudioLevels }  from 'svelte-touch-os/src/index.js'
  import { Any, Button, Column, Row, Block } from 'svelte-aui/src/index.js'

  const style = "";//"position:absolute;width:calc( 50% - 20px );bottom:10px;";

  export let data;

  $: session = data[0];
  $: isSound = session.point_of_interest == 'sound';

</script>

<!-- check levels and camera... -->

<Row className="p06">

  <Button a={{grow: true}}>
    <a href={'/session/'+session.url}>
      <ArrowLeft />
    </a>
  </Button>

  <Block  a={{grow: false, width: '360px'}} className="align-center" style="height:240px;">
    {#if isSound} 
      <AudioLevels style="height: 100%" />
      <Microphone size="2em" />
    {:else}
      <WebCam width="360px" height="240px" focus={session.point_of_interest} /> 
    {/if}
  </Block>

  <Button a={{grow: true}}>
    <a href={'/session/'+session.url+'/1'}>
      <Check />
    </a>
  </Button>

</Row>
