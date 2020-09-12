<script>

  import { createEventDispatcher } from 'svelte';
  import { stores } from '@sapper/app';
  import { onMount, onDestroy } from 'svelte'
  const { preloading, page, session } = stores();

  const dispatch = createEventDispatcher();
  export let time;
  export let size = 150;
  export let style;
  export let className = "spin";
  export let paused = false;
  export let id = "";

  let human;
  let timer;
  let timestamp;
  let destroy = false;


  $: computed = `font-size:${size * 0.4}px;line-height:${size}px;border-radius:${size}px;width:${size}px;height:${size}px;flex-basis:${size}px;max-height:${size}px;`
  $: radius = `border-radius:${size}px;animation-delay:-${Math.floor(Math.random() * 100)}s;`;

  onMount( async() => {
    destroy = false;
    console.log('[Timer] ⏰✅  onMount (restart) :', id);
    restart( time );
  });
  onDestroy(() => {
    console.log('[Timer] ⏰❌  onDestroy:', id);
    destroy = true;
  });

  export function restart( time_ ) {
    if (typeof window !== "undefined" && typeof document !== "undefined" && !destroy) {
      clearAllFrames();
      time = time_;
      human = time;
      timer = time;
      gap = 0;
      timestamp = (new Date());
      console.log('[Timer] ⏰  onRestart:', id);
      window.requestAnimationFrame(onFrame);
      dispatch( 'start', timer );
    }
  }


  function clearAllFrames() {
    for (var i = 1; i < 99999; i++) {
      window.clearInterval(i);
      window.cancelAnimationFrame(i);
    }
  }

  let gap;

  function onFrame() {

    if (typeof window !== "undefined" && typeof document !== "undefined") {

      let req = true;
      if (!paused && human > 0) {
        gap = ((new Date()) - timestamp)/1000;
        const prevHuman = human;
        timer = time - gap;
        human = parseInt(timer, 10);
        if (human != prevHuman) {
          dispatch( 'second', timer );
          if (human == 0) {
            dispatch( 'end', timer );
            clearAllFrames();
            req = false;
          }
        }
      } else {
        timestamp = (new Date()) - (gap * 1000);
      }
      if (req && !destroy) {
        console.log('[Timer] ⏰  onFrame:', id);
        window.requestAnimationFrame( onFrame );
      }
    } else {
      console.error('there is no window to request animation frame from');
    }
  }

  
</script>
<div class="timer {className} { paused ? 'paused' : ''}" style="{computed}{style}">
  <span class="ring a" style="{radius}"></span>
  <span class="ring b" style="{radius}"></span>
  <span class="ring c" style="{radius}"></span>
  <span class="bg" style="{radius}"></span>
  <span class="txt">{human}</span>
</div>

<style lang="sass">

@keyframes spin
  from 
    transform: rotate(0deg)
  to 
    transform: rotate(360deg)
@keyframes pulse
  0%
    transform: scale(0.9)
  50% 
    transform: scale(1)
  100% 
    transform: scale(0.9)

.timer 
  text-align: center
  position: relative
  box-sizing: border-box
  overflow: hidden
  &.spin
    border-color: white
  &.pulse
    $spd: 6
    color: #111
    .ring
      transform-origin: 60% 40%
      background: white
      animation: spin 5s infinite linear
      animation-duration: 5s * $spd
      animation-play-state: running
      opacity: 0.7
      &.b
        transform-origin: 40% 60%
        animation-duration: 7.5s * $spd
        animation-direction: reverse
      &.c
        transform-origin: 30% 50%
        animation-duration: 10s * $spd
  *
    box-sizing: border-box
  .bg, .ring
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    z-index: 1
  .txt
    position: relative
    z-index: 2
  &.spin
    $spd: 6
    .ring
      transform-origin: 50% 50%
      border: 3px dashed
      animation: spin 5s infinite linear
      animation-duration: 5s * $spd
      animation-play-state: running
      &.b
        left: 5%
        top: 5%
        width: 90%
        height: 90%
        animation-duration: 7.5s * $spd
        animation-direction: reverse
      &.c
        left: 10%
        top: 10%
        width: 80%
        height: 80%
        animation-duration: 10s * $spd
  &.spin.paused
    $spd: 6
    .ring
      animation-play-state: paused


</style>