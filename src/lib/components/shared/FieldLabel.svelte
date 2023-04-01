<script lang="ts">
  export let fieldId: string;
</script>

<label
  class="font-sans text-sm text-slate-400 underline decoration-dotted underline-offset-4"
  for={fieldId}><slot /></label
>
