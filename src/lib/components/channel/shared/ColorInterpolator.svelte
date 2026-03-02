<script lang="ts">
  import { onMount } from 'svelte';

  import type {
    InterpolatorDirection,
    QuantitativeColorInterpolator
  } from '$lib/types';
  import { materializeColorInterpolator } from '$lib/utils/color/interpolator';

  interface Props {
    interpolator: QuantitativeColorInterpolator;
    direction: InterpolatorDirection;
  }

  const RAMP_HEIGHT = 16;
  const RAMP_WIDTH = 256;

  let { interpolator, direction }: Props = $props();
  let interpolate = $derived(
    materializeColorInterpolator(interpolator, direction)
  );

  let canvas: HTMLCanvasElement;

  function drawRamp(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < RAMP_WIDTH; ++i) {
      const t = i / (RAMP_WIDTH - 1);
      ctx.fillStyle = interpolate(t);
      ctx.fillRect(i, 0, 1, RAMP_HEIGHT);
    }
  }

  onMount(() => {
    const ctx = canvas.getContext('2d');

    canvas.style.width = '100%';
    canvas.style.height = `${RAMP_HEIGHT}px`;

    if (ctx) {
      drawRamp(ctx);
    }
  });

  $effect(() => {
    const ctx = canvas.getContext('2d');

    if (ctx) {
      drawRamp(ctx);
    }
  });
</script>

<div class="flex h-4 w-full">
  <canvas bind:this={canvas} width={RAMP_WIDTH} height={RAMP_HEIGHT}></canvas>
</div>
