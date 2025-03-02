import { on } from 'svelte/events';

import { dispatchLayerUpdate } from '$lib/interaction/update';
import { history } from '$lib/state/history.svelte';

/**
 * Initialize our history interface for undo / redo functionality.
 *
 * @returns – A function to remove the undo / redo event listener.
 */
export function initHistory() {
  const off = on(document, 'keydown', (event) => {
    // Redo action.
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key === 'z'
    ) {
      const update = history.redo.pop();

      if (update) {
        history.undo.push(update);
        dispatchLayerUpdate(update.execute);
      }
      // Undo action.
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      const update = history.undo.pop();

      if (update) {
        history.redo.push(update);
        dispatchLayerUpdate(update.invert);
      }
    }
  });

  return off;
}
