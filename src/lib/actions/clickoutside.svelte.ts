import { on } from 'svelte/events';

/**
 * A Svelte action to detect clicks outside of an element.
 *
 * @param node – The element to detect clicks outside of.
 * @param callback – A callback to invoke when a click outside of the element is
 * detected.
 */
export function clickoutside<T extends HTMLElement>(
  node: T,
  callback: (event: MouseEvent) => void
) {
  function handle(event: MouseEvent) {
    if (!event.target) {
      return;
    }

    if (!node.contains(event.target as Node) && !event.defaultPrevented) {
      callback(event);
    }
  }

  $effect(() => {
    const remove = on(document, 'click', handle);

    return remove;
  });
}
