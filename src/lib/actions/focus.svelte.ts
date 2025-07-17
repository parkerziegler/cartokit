export function focus<T extends HTMLElement>(node: T, active: () => boolean) {
  $effect(() => {
    if (active()) {
      node.focus();
    }
  });
}
