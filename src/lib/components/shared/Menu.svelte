<script lang="ts">
  import cs from 'classnames';

  let className = '';
  export { className as class };
  export let id = '';
</script>

<div
  {id}
  class={cs('stack-border rounded-md bg-slate-900 shadow-lg', className)}
>
  <slot />
</div>
