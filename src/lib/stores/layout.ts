import { writable } from 'svelte/store';

interface Layout {
  dataVisible: boolean;
  sourceVisible: boolean;
}

export const layout = writable<Layout>({
  dataVisible: false,
  sourceVisible: false
});
