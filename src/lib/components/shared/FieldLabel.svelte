<script lang="ts">
  export let fieldId: string;
</script>

<label
  class="font-sans text-slate-400 text-sm underline decoration-dotted underline-offset-4"
  for={fieldId}><slot /></label
>
