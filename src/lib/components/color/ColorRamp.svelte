<script lang="ts">
  import { onMount } from 'svelte';

  import type { ColorRamp, SchemeDirection } from '$lib/types';
  import { materializeColorRamp } from '$lib/utils/ramp';

  interface Props {
    ramp: ColorRamp;
    direction: SchemeDirection;
  }

  let { ramp, direction }: Props = $props();
  let colors = $derived(materializeColorRamp(ramp, direction));

  let canvas: HTMLCanvasElement;

  function drawRamp(ctx: CanvasRenderingContext2D, cs: string[]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < cs.length; ++i) {
      ctx.fillStyle = cs[i];
      ctx.fillRect(i, 0, 1, 16);
    }
  }

  onMount(() => {
    const ctx = canvas.getContext('2d');

    canvas.style.width = '100%';
    canvas.style.height = '16px';

    if (ctx) {
      drawRamp(ctx, colors);
    }
  });

  $effect(() => {
    const ctx = canvas.getContext('2d');

    if (ctx) {
      drawRamp(ctx, colors);
    }
  });
</script>

<div class="flex h-4 w-full">
  <canvas bind:this={canvas} width={colors.length} height={16}></canvas>
</div>
