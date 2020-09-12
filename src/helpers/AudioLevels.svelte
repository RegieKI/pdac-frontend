<script>

  import { onMount } from 'svelte'
  import Microphone from "svelte-material-icons/Microphone.svelte";

  let ref;
  let audioLevel = 0;
  let incomingAudio = 0;

  export let style;
  export let orientation = 'vertical';

  $: isVertical = orientation == 'vertical';
  $: size = `height: ${audioLevel}%`


  let streamPtr;

  onDestroy(() => {
    if (!streamPtr) return;
    streamPtr.getTracks().forEach(function(track) {
      console.log('[AudioLevels] 🔈☠️  destroying stream:', track);
      track.stop();
    });
  });

  function onFrame() {

    audioLevel = incomingAudio;
    window.requestAnimationFrame(onFrame);

  }
  onMount( async() => {
    if (process.browser ) {
      if (navigator.mediaDevices) {


        console.log('YOYOYO')


        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(function(stream) {

          streamPtr = stream;
          console.log('[AudioLevels] 🔈✅  successfully opened', stream)

          const audioContext = new AudioContext();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);
          const javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);

          analyser.smoothingTimeConstant = 0.8;
          analyser.fftSize = 1024;

          microphone.connect(analyser);
          analyser.connect(javascriptNode);
          javascriptNode.connect(audioContext.destination);
          window.requestAnimationFrame(onFrame);
          javascriptNode.onaudioprocess = function() {
              var array = new Uint8Array(analyser.frequencyBinCount);
              analyser.getByteFrequencyData(array);
              var values = 0;

              var length = array.length;
              for (var i = 0; i < length; i++) {
                values += (array[i]);
              }

              incomingAudio = Math.round( values / length );

          }
          })
          .catch(function(err) {
            console.error(err);
        });
      } 
    }
  });
</script>

<style lang="sass">
.audio-levels
  position: relative
  overflow: hidden
  justify-content: center
  flex-direction: row
  align-items: center
  .inner
    margin: 0 auto
    display: flex
    flex-grow: 1
    position: relative
    width: 15px
    min-height: 100%
    text-align: center
    .meter
      width: 5px
      height: 100%
      position: absolute
      top: 0
      display: block
      &.left
        left: 0
      &.right
        right: 0
      span
        position: absolute
        bottom: 0
        left: 0
        display: block
        width: 100%
        background: white

</style>

<div class="audio-levels" on:click style={style} >
  <div class="inner">
    <div class="left meter"><span style={size} /></div>
    <div class="right meter"><span style={size} /></div>
  </div>
</div>







