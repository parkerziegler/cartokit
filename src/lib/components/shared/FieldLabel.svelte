<script lang="ts">
	export let fieldId: string;
</script>

<label class="font-sans text-slate-400 text-sm underline decoration-dotted py-2" for={fieldId}
	><slot /></label
>
