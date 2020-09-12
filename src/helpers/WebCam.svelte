<script>

  import { onMount, onDestroy } from 'svelte'
  export let style;
  let ref;

  export let width = 'auto';
  export let height = 'auto';
  export let focus = "none";

  let streamPtr;

  onDestroy(() => {
    if (!streamPtr) return;
    streamPtr.getTracks().forEach(function(track) {
      console.log('[WebCam] 🎥☠️  destroying stream:', track);
      track.stop();
    });
  });

  onMount( async() => {
    if (process.browser ) {
      if (navigator.mediaDevices) {
        if (navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ video: {width: 480, height: 320} })
            .then(function (stream) { 
              streamPtr = stream;
              console.log('[WebCam] 🎥✅  successfully opened', stream)
              ref.srcObject = stream;
              ref.onloadedmetadata = function(e) {
                ref.play();
              };
            })
            .catch(function (err) {
              console.log('[WebCam] 🎥❌  error opening:', err)
            }); 
        }
      } else {
        alert('SSL is needed for mediaDevices')
      }
    }
  });
</script>

<style lang="sass">
.webcam
  position: relative
  overflow: hidden
  video
    object-fit: contain
    height: 100%
  svg
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
</style>

<div class="webcam" on:click style="width: {width}; height: {height}; {style}" >
  <video bind:this={ref} style="width: {width}; height: {height}"></video>


  {#if focus == 'body'}

    <svg class="body" width="100%" height="100%" viewBox="0 0 480 320" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
        <g transform="matrix(0.303359,0,0,0.303359,-76.4356,-172.363)">
            <circle cx="1042.46" cy="736.603" r="47.55" style="fill:none;stroke:rgb(255,255,255);stroke-width:11.67px;"/>
        </g>
        <g transform="matrix(0.303359,0,0,0.303359,-61.8165,-164.263)">
            <path d="M899.814,842.866L1070.12,1102.16L919.714,1102.16L1090.02,842.866L899.814,842.866Z" style="fill:none;stroke:rgb(255,255,255);stroke-width:11.67px;"/>
        </g>
        <g transform="matrix(0.303359,0,0,0.303359,-67.8532,-164.263)">
            <path d="M879.915,1136.8L879.915,986.272L919.714,842.866" style="fill:none;stroke:rgb(255,255,255);stroke-width:11.67px;"/>
        </g>
        <g transform="matrix(-0.303359,0,0,0.303359,547.853,-164.263)">
            <path d="M879.915,1136.8L879.915,986.272L919.714,842.866" style="fill:none;stroke:rgb(255,255,255);stroke-width:11.67px;"/>
        </g>
        <g transform="matrix(0.303359,0,0,0.356008,-61.8165,-208.64)">
            <path d="M994.915,842.866L994.915,689.053" style="fill:none;stroke:rgb(255,255,255);stroke-width:10.71px;"/>
        </g>
        <g transform="matrix(0.303359,0,0,0.303359,-61.8165,-164.263)">
            <path d="M919.714,1102.16L955.517,1303.46L973.734,1516.85" style="fill:none;stroke:rgb(255,255,255);stroke-width:11.67px;"/>
        </g>
        <g transform="matrix(-0.303359,0,0,0.303359,541.817,-164.263)">
            <path d="M919.714,1102.16L955.517,1303.46L973.734,1516.85" style="fill:none;stroke:rgb(255,255,255);stroke-width:11.67px;"/>
        </g>
    </svg>

  {/if}

  {#if focus == 'face'}
    <svg class="face" width="100%" height="100%" viewBox="0 0 480 320" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
        <g transform="matrix(0.303359,0,0,0.303359,-76.4356,-172.363)">
            <g transform="matrix(3.70983,0,0,3.70983,-2826.64,-1876.21)">
                <circle cx="1042.46" cy="736.603" r="47.55" style="fill:none;stroke:white;stroke-width:3.11px;"/>
            </g>
            <g transform="matrix(3.29642,0,0,3.29642,242.176,600.802)">
                <circle cx="219.132" cy="70.482" r="8.134" style="fill:none;stroke:white;stroke-width:3.5px;"/>
            </g>
            <g transform="matrix(3.29642,0,0,3.29642,399.332,600.802)">
                <circle cx="219.132" cy="70.482" r="8.134" style="fill:none;stroke:white;stroke-width:3.5px;"/>
            </g>
        </g>
        <g transform="matrix(1.12541,0,0,1.12541,-879.689,-744.414)">
            <path d="M899.814,842.866L1070.12,1102.16L919.714,1102.16L1090.02,842.866L899.814,842.866Z" style="fill:none;stroke:white;stroke-width:3.11px;"/>
        </g>
        <g transform="matrix(1.12541,0,0,1.12541,-902.084,-744.414)">
            <path d="M879.915,1136.8L879.915,986.272L919.714,842.866" style="fill:none;stroke:white;stroke-width:3.11px;"/>
        </g>
        <g transform="matrix(-1.12541,0,0,1.12541,1382.08,-744.414)">
            <path d="M879.915,1136.8L879.915,986.272L919.714,842.866" style="fill:none;stroke:white;stroke-width:3.11px;"/>
        </g>
        <g transform="matrix(1.12541,0,0,1.10663,-879.689,-728.579)">
            <path d="M994.915,842.866L994.915,689.053" style="fill:none;stroke:white;stroke-width:2.85px;"/>
        </g>
    </svg>
  {/if}

</div>