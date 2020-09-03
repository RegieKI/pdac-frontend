<script>

  import axios from 'axios'
  import { onMount } from 'svelte'
  import { goto } from '@sapper/app';
  // icons...

  // stores...

  import { info, overlay } from './../../stores.js'
  import { stores } from '@sapper/app';
  const { page } = stores();

  import { Any, Button, Column, Row } from '../../../svelte-aui/src/index.js'

  export let data;

</script>
