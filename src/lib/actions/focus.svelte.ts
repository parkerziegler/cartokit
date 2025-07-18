/**
 * A Svelte action to focus an element when a condition is met.
 *
 * @param node – The element to focus.
 * @param predicate – A predicate indicating whether the element should be
 * focused.
 */
export function focus<T extends HTMLElement>(
  node: T,
  predicate: () => boolean
) {
  $effect(() => {
    if (predicate()) {
      node.focus();
    }
  });
}
