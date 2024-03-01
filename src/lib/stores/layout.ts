import { writable } from 'svelte/store';

interface Layout {
  dataVisible: boolean;
  editorVisible: boolean;
}

export const layout = writable<Layout>({
  dataVisible: false,
  editorVisible: false
});
