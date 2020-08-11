<script>

  import { Any, Group, Button } from '../svelte-aui/src/index.js'
  import { info } from './Store.js'

</script>

<style lang="sass">

  .pdac-viewer
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    video
      width: 100%
      height: 100%
      top: 0
      left: 0
    .bg
      position: absolute
      width: 100%
      height: 100%
      top: 0
      left: 0
      .line
        stroke: #999
</style>

<div class="pdac-viewer">
  <svg class="bg" viewBox="0 0 10 10" preserveAspectRatio="none">
    <path class="line" d='M 0 0 L 10 10 ' vector-effect="non-scaling-stroke" />
    <path class="line" d='M 10 0 L 0 10 ' vector-effect="non-scaling-stroke" />
  </svg>
<video></video>
</div>