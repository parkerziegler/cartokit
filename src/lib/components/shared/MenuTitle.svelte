<script lang="ts">
  import cs from 'classnames';

  interface Props {
    class?: string;
    action?: import('svelte').Snippet;
    subtitle?: import('svelte').Snippet;
    children?: import('svelte').Snippet;
  }

  let { class: className = '', action, subtitle, children }: Props = $props();
</script>

{#if action && subtitle}
  <div class="stack stack-xs p-4 text-white">
    <div class="flex items-center justify-between">
      <p class={cs('font-sans text-lg font-medium tracking-wider', className)}>
        {@render children?.()}
      </p>
      {@render action?.()}
    </div>
    {@render subtitle?.()}
  </div>
{:else if action}
  <div class="flex items-center justify-between p-4 text-white">
    <p class={cs('font-sans text-xl font-medium tracking-wider', className)}>
      {@render children?.()}
    </p>
    {@render action?.()}
  </div>
{:else}
  <p
    class={cs(
      'p-4 font-sans text-xl font-medium tracking-wider text-white',
      className
    )}
  >
    {@render children?.()}
  </p>
{/if}
