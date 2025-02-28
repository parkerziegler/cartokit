import type { DispatchLayerUpdateParams } from '$lib/interaction/update';

export const history = $state<{
  undo: {
    execute: DispatchLayerUpdateParams;
    invert: DispatchLayerUpdateParams;
  }[];
  redo: {
    execute: DispatchLayerUpdateParams;
    invert: DispatchLayerUpdateParams;
  }[];
}>({
  undo: [],
  redo: []
});
