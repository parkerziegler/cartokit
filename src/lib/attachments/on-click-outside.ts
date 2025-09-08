import type { Attachment } from 'svelte/attachments';
import { on } from 'svelte/events';

interface ClickOutsideOptions {
  callback: (event: MouseEvent) => void;
}

/**
 * A Svelte attachment to detect clicks outside of an element.
 *
 * @param options – The options for the attachment, consisting of the callback
 * function to run when click outside of the target element is detected.
 * @returns An @see{Attachment} to be used in a Svelte component.
 */
export function onClickOutside(options: ClickOutsideOptions): Attachment {
  return (element) => {
    const { callback } = options;

    function handle(event: MouseEvent) {
      if (!element.contains(event.target as Node) && !event.defaultPrevented) {
        callback(event);
      }
    }

    const off = on(document, 'click', handle);

    return off;
  };
}
