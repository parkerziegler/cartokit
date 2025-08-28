import { on } from 'svelte/events';

/**
 * Register a global keybinding.
 *
 * @param key – The key to bind the callback to.
 * @param callback – The callback to invoke when the key is pressed.
 */
export function registerKeybinding(
  key: string,
  callback: () => void
): () => void {
  return on(document, 'keydown', (event) => {
    if (
      event.target instanceof HTMLElement &&
      (event.target.nodeName === 'INPUT' ||
        event.target.nodeName === 'TEXTAREA')
    ) {
      event.stopPropagation();
      return;
    }

    if (event.key === key) {
      callback();
    }
  });
}
