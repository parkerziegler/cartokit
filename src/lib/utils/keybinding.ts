import { on } from 'svelte/events';

/**
 * Register a global keybinding.
 *
 * @param key The key to bind the callback to.
 * @param callback The callback to invoke when the key is pressed.
 * @param options.requireShift Whether the keybinding requires the shift key to be pressed.
 * @returns A function to deregister the keybinding.
 */
export function registerKeybinding(
  key: string,
  callback: () => void,
  {
    requireShift = false,
    requireMetaAndOption = false
  }: {
    requireShift?: boolean;
    requireMetaAndOption?: boolean;
  } = {}
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

    // Check if the keybind matches.
    // If so, ensure it's not
    //   1. Using Cmd+Key / Ctrl+Key (e.g., Cmd+C copying should not trigger the Chat window.)
    //   2. Either does not require Shift, or is pressing Shift if required.
    if (
      event.key === key &&
      !(event.metaKey || event.ctrlKey) &&
      (!requireShift || event.shiftKey)
    ) {
      event.preventDefault();
      callback();
    }

    // Option alters `event.key` on macOS (e.g., ⌥B yields "∫"), so match on
    // the physical key via `event.code` instead.
    if (
      event.code === `Key${key.toUpperCase()}` &&
      requireMetaAndOption &&
      event.metaKey &&
      event.altKey
    ) {
      event.preventDefault();
      callback();
    }
  });
}
