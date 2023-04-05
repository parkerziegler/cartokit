<script lang="ts">
  export let title: string;
</script>

<div class="stack stack-xs p-4 font-mono text-xs text-white">
  <p class="font-sans text-base font-medium tracking-wider">
    {title}
  </p>
  <slot />
</div>
