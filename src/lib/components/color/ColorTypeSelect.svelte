<script>
  import Select from '$lib/components/shared/Select.svelte';

  const options = ['Categories', 'Range'].map((option) => ({
    value: option,
    label: option
  }));
</script>

<Select
  title="Style by"
  {options}
  selected="Categories"
  id="color-style-by-select"
/>
