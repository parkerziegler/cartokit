<script lang="ts">
  import { onMount } from 'svelte';

  import type { ColorRamp, RampDirection } from '$lib/types';
  import { materializeColorRamp } from '$lib/utils/color/ramp';

  interface Props {
    ramp: ColorRamp;
    direction: RampDirection;
  }

  const RAMP_HEIGHT = 16;
  let { ramp, direction }: Props = $props();
  let colors = $derived(materializeColorRamp(ramp, direction));

  let canvas: HTMLCanvasElement;

  function drawRamp(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < colors.length; ++i) {
      ctx.fillStyle = colors[i];
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
  <canvas bind:this={canvas} width={colors.length} height={RAMP_HEIGHT}
  ></canvas>
</div>
