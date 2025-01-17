<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    fieldId: string;
    children: Snippet;
  }

  let { fieldId, children }: Props = $props();
</script>

<label
  class="font-sans text-sm text-slate-400 underline decoration-dotted underline-offset-4"
  for={fieldId}>{@render children()}</label
>
