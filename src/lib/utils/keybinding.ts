import { on } from 'svelte/events';

/**
 * Register a global keybinding.
 *
 * @param key The key to bind the callback to.
 * @param callback The callback to invoke when the key is pressed.
 * @param options The options for the keybinding.
 * @param options.requireShift Whether the keybinding requires the shift key to be pressed.
 * @returns A function to deregister the keybinding.
 */
export function registerKeybinding(
  key: string,
  callback: () => void,
  { requireShift = false }: { requireShift?: boolean } = {}
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

    if (event.key === key && (!requireShift || event.shiftKey)) {
      callback();
    }
  });
}
