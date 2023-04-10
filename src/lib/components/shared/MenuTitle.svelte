{#if $$slots.action}
  <div class="flex items-center justify-between p-4 text-white">
    <p class="font-sans text-xl font-medium tracking-wider {$$props.class}">
      <slot />
    </p>
    <slot name="action" />
  </div>
{:else}
  <p class="p-4 font-sans text-xl font-medium tracking-wider text-white">
    <slot />
  </p>
{/if}
