<script context="module">
  import { AutoPreload } from './../../../helpers/Utils.js'
  export async function preload( page, session ) { return AutoPreload(page, session, this) }
</script>
<script>

  import axios from 'axios'
  import { onMount } from 'svelte'
  import { goto } from '@sapper/app';
  // icons...

  // stores...

  import { info, overlay } from './../../stores.js'
  import { stores } from '@sapper/app';
  const { page } = stores();

  import { Any, Button, Column, Row } from 'svelte-aui/src/index.js'

  export let data;
  $: session = data[0] || {};

</script>

<div style="margin: 0.5em 0em">Complete: {session.title}</div>
<Row>
  <Button><a href="/session">Sessions</a></Button>
  <Button><a href="/sync">Sync</a></Button>
</Row>