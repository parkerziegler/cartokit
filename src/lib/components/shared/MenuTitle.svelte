<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    action?: Snippet;
    subtitle?: Snippet;
    children: Snippet;
  }

  let { class: className = '', action, subtitle, children }: Props = $props();
</script>

{#if action && subtitle}
  <div class="flex flex-col gap-2 p-4 text-white">
    <div class="flex items-center justify-between">
      <p class={['font-sans text-lg font-medium tracking-wider', className]}>
        {@render children()}
      </p>
      {@render action?.()}
    </div>
    {@render subtitle?.()}
  </div>
{:else if action}
  <div class="flex items-center justify-between p-4 text-white">
    <p class={['font-sans text-xl font-medium tracking-wider', className]}>
      {@render children?.()}
    </p>
    {@render action?.()}
  </div>
{:else}
  <p
    class={[
      'p-4 font-sans text-xl font-medium tracking-wider text-white',
      className
    ]}
  >
    {@render children?.()}
  </p>
{/if}
