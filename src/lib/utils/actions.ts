import type { ActionReturn } from 'svelte/action';

/**
 * A Svelte action to detect clicks outside of an element.
 *
 * @param node – The element to detect clicks outside of.
 * @returns – An ActionReturn object with a `destroy` method to remove the event
 * listener.
 */
export function clickOutside<T extends HTMLElement>(
  node: T
): ActionReturn<
  undefined,
  { 'on:clickoutside': (event: CustomEvent<MouseEvent>) => void }
> {
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
}