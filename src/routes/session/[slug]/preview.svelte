<script context="module">
  import { AutoPreload } from './../../../helpers/Utils.js'
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

  import WebCam from './../../../helpers/WebCam.svelte'
  import Back from './../../../helpers/Back.svelte'
  import AudioLevels from './../../../helpers/AudioLevels.svelte'
  import { Any, Button, Column, Row } from '../../../svelte-aui/src/index.js'

  const style = "";//"position:absolute;width:calc( 50% - 20px );bottom:10px;";

  export let data;

  $: session = data[0];
  $: isSound = session.point_of_interest == 'sound';

</script>

<!-- check levels and camera... -->
<Row a={{justify: 'center'}}>
  <Button a={{stretch: true}}>
    <a href={'/session/'+session.url}>
      <ArrowLeft />
    </a>
  </Button>
  <Column a={{justify: 'center'}}>
    <AudioLevels />
    {#if !isSound} <WebCam width="360px" height="240px" focus={session.point_of_interest} /> {/if}
  </Column>
  <Button a={{stretch: true}}>
    <a href={'/session/'+session.url+'/0'}>
      <Check />
    </a>
  </Button>
</Row>
<!-- <Row>
</Row> -->
