import type { Action } from 'svelte/action';

/**
 * A svelte action to detect clicks outside of an element.
 * @param node
 * @returns
 */
export const clickOutside: Action<
  HTMLElement,
  undefined,
  { 'on:clickoutside': (event: CustomEvent<MouseEvent>) => void }
> = (node) => {
  const handle = (event: MouseEvent) => {
    if (!event.target) {
      return;
    }

    if (!node.contains(event.target as Node) && !event.defaultPrevented) {
      node.dispatchEvent(new CustomEvent('clickoutside', { detail: event }));
    }
  };

  document.addEventListener('click', handle, true);

  return {
    destroy() {
      document.removeEventListener('click', handle, true);
    }
  };
};
