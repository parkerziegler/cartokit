<script lang="ts">
  import cs from 'classnames';

  let className = '';
  export { className as class };
</script>

{#if $$slots.action}
  <div class="flex items-center justify-between p-4 text-white">
    <p class={cs('font-sans text-xl font-medium tracking-wider', className)}>
      <slot />
    </p>
    <slot name="action" />
  </div>
{:else}
  <p class="p-4 font-sans text-xl font-medium tracking-wider text-white">
    <slot />
  </p>
{/if}
