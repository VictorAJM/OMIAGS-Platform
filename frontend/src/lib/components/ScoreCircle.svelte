<script>
  import { onMount } from 'svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let score = 0; // The final score (0-100)

  const size = 200;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedScore = tweened(0, {
    duration: 800,
    easing: cubicOut,
  });

  onMount(() => {
    animatedScore.set(score);
  });

  $: strokeDashoffset = circumference * (1 - $animatedScore / 100);
  $: scoreColor =
    $animatedScore < 50 ? '#d93025' : $animatedScore < 80 ? '#fbbc05' : '#1e8e3e';
</script>

<div class="score-container" style="--score-color: {scoreColor};">
  <svg width={size} height={size} viewBox="0 0 {size} {size}" class="score-svg">
    <circle
      class="score-background"
      cx={size / 2}
      cy={size / 2}
      r={radius}
      stroke-width={strokeWidth}
    />
    <circle
      class="score-foreground"
      cx={size / 2}
      cy={size / 2}
      r={radius}
      stroke-width={strokeWidth}
      stroke-dasharray={circumference}
      stroke-dashoffset={strokeDashoffset}
      transform="rotate(-90 {size / 2} {size / 2})"
    />
  </svg>
  <div class="score-text">
    {Math.round($animatedScore)}%
  </div>
</div>

<style>
  .score-container {
    position: relative;
    width: 200px;
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .score-svg {
    position: absolute;
    top: 0;
    left: 0;
  }

  .score-background {
    fill: none;
    stroke: #e8eaed;
  }

  .score-foreground {
    fill: none;
    stroke: var(--score-color);
    stroke-linecap: round;
    transition: stroke 0.3s;
  }

  .score-text {
    font-size: 3rem;
    font-weight: bold;
    color: var(--score-color);
    transition: color 0.3s;
  }
</style>