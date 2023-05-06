<script lang="ts">
  import cs from 'classnames';

  let className = '';
  export { className as class };
</script>

<div class={cs('stack-border rounded-md bg-slate-900', className)}>
  <slot />
</div>
