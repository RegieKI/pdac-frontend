<script context="module">
  import { AutoPreload } from 'svelte-touch-os/src/index.js'
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

<Column a={{grow: true}} className="justify-center align-center" >
  <div class="mtb1">Complete: {session.title}</div>
  <Row a={{height: '60px'}}>
    <Button a={{grow: true}} style="min-width: 160px" ><a href="/session">Sessions</a></Button>
    <Button a={{grow: true}} style="min-width: 160px" ><a href="/sync">Sync</a></Button>
  </Row>
</Column>