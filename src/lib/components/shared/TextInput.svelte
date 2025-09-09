<script lang="ts">
  import type { FormEventHandler, KeyboardEventHandler } from 'svelte/elements';

  import { onClickOutside } from '$lib/attachments/on-click-outside';

  interface Props {
    value: string;
    oninput?: FormEventHandler<HTMLInputElement>;
    onblur?: FormEventHandler<HTMLInputElement>;
    onkeydown?: KeyboardEventHandler<HTMLInputElement>;
    onclickoutside?: () => void;
    placeholder?: string;
    id?: string;
    class?: string;
    selectTextOnRender?: boolean;
  }

  let {
    value,
    oninput = () => {},
    onblur = () => {},
    onkeydown = () => {},
    onclickoutside = () => {},
    placeholder = '',
    id = '',
    class: className = '',
    selectTextOnRender = false
  }: Props = $props();

  function selectText(element: HTMLInputElement) {
    element.select();
  }
</script>

<input
  {value}
  {placeholder}
  {id}
  {oninput}
  {onblur}
  {onkeydown}
  class={[
    'border border-slate-600 bg-slate-900 p-2 placeholder:text-slate-400 hover:border-slate-400 focus-visible:border-slate-400',
    className
  ]}
  {@attach onClickOutside({ callback: onclickoutside })}
  {@attach selectTextOnRender && selectText}
/>
