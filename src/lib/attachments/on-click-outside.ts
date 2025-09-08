import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';

interface ClickOutsideOptions {
  callback: () => void;
}

export function onClickOutside(options: ClickOutsideOptions): Attachment {
  return (element) => {
    const { callback } = options;

    function handle(event: MouseEvent) {
      if (!element.contains(event.target as Node) && !event.defaultPrevented) {
        callback();
      }
    }

    const off = on(document, 'click', handle);

    return off;
  };
}
