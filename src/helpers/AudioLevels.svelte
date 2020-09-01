<script>

  import { onMount } from 'svelte'
  export let style;
  let ref;

  let audioLevel = 0;
  let incomingAudio = 0;


  function onFrame() {

    audioLevel = incomingAudio;
    window.requestAnimationFrame(onFrame);
    console.log('VOILUMNE...', audioLevel);

  }
  onMount( async() => {
    if (process.browser ) {
      if (navigator.mediaDevices) {


        console.log('YOYOYO')


        navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        .then(function(stream) {
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
  .meter
    min-height: 10px
</style>

<div class="audio-levels" on:click style={style} >
  AUDIO LEVELKS {audioLevel}
</div>







