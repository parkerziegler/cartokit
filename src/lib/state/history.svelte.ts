import { on } from 'svelte/events';

import { applyDiff, type CartoKitDiff } from '$lib/core/diff';

// Use $state.raw to avoid deep reactivity and Proxies.
//
// 'add-layer' uses a WebWorker to fetch GeoJSON and build the catalog off the
// main thread, so we need to keep the full layer payload serializable by
// structured clone. $state by default will create Proxies for all Arrays and
// Objects, which will throw at runtime when structuredClone runs.
export const history = $state.raw<{
  undo: {
    execute: CartoKitDiff;
    invert: CartoKitDiff;
  }[];
  redo: {
    execute: CartoKitDiff;
    invert: CartoKitDiff;
  }[];
}>({
  undo: [],
  redo: []
});

/**
 * Initialize our history interface for undo / redo functionality.
 *
 * @returns A function to remove the undo / redo event listener.
 */
export function initHistory() {
  const off = on(document, 'keydown', (event) => {
    // Redo action.
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.key === 'z'
    ) {
      const diff = history.redo.pop();

      if (diff) {
        applyDiff(diff.execute);
      }
      // Undo action.
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      const diff = history.undo.pop();

      if (diff) {
        // Apply the invert diff when a user undoes something. Flag this diff as triggered
        // by undo so we push to the redo stack when we apply the diff.
        applyDiff(diff.invert, true);
      }
    }
  });

  return off;
}
