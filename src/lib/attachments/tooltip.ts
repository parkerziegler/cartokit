import {
  computePosition,
  offset,
  shift,
  type OffsetOptions,
  type Placement
} from '@floating-ui/dom';
import type { Attachment } from 'svelte/attachments';

interface TooltipOptions {
  content: string;
  keybinding?: string;
  placement?: Placement;
  offsetValue?: OffsetOptions;
}

/**
 * A Svelte attachment to display a tooltip for an element.
 *
 * @param options The options for the attachment, consisting of the content
 * of the tooltip, the keybinding to display, the placement of the tooltip, and
 * the offset value of the tooltip.
 * @returns An {@link Attachment} to be used in a Svelte component.
 */
export function tooltip(options: TooltipOptions): Attachment {
  return (element) => {
    const { content, keybinding, placement = 'top', offsetValue = 6 } = options;

    const tt = document.createElement('div');

    tt.textContent = content;

    if (keybinding) {
      const kb = document.createElement('span');
      kb.className = 'keybinding';
      kb.textContent = keybinding;
      tt.appendChild(kb);
    }

    tt.style.display = 'none';
    tt.style.position = 'absolute';
    tt.classList.add(
      'tooltip',
      'will-change-transform-opacity',
      'animate-slide-down-and-fade'
    );
    document.body.appendChild(tt);

    let timeoutId: number;

    function update() {
      computePosition(element, tt, {
        placement,
        middleware: [offset(offsetValue), shift({ padding: 8 })]
      }).then(({ x, y }) => {
        Object.assign(tt.style, {
          left: `${x}px`,
          top: `${y}px`
        });
      });
    }

    function showTooltip() {
      timeoutId = window.setTimeout(() => {
        tt.style.display = 'flex';
        update();
      }, 400);
    }

    function hideTooltip() {
      tt.style.display = 'none';
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    }

    [
      ['mouseenter', showTooltip],
      ['mouseleave', hideTooltip],
      ['focus', showTooltip],
      ['blur', hideTooltip]
    ].forEach(([event, listener]) => {
      element.addEventListener(
        event as 'mouseenter' | 'mouseleave' | 'focus' | 'blur',
        listener as EventListener
      );
    });

    return () => {
      [
        ['mouseenter', showTooltip],
        ['mouseleave', hideTooltip],
        ['focus', showTooltip],
        ['blur', hideTooltip]
      ].forEach(([event, listener]) => {
        element.removeEventListener(
          event as 'mouseenter' | 'mouseleave' | 'focus' | 'blur',
          listener as EventListener
        );
      });

      tt.remove();
    };
  };
}
