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

export function tooltip(options: TooltipOptions): Attachment {
  return (element) => {
    const { content, keybinding, placement = 'top', offsetValue = 6 } = options;

    const tt = document.createElement('div');
    tt.innerHTML = content;
    if (keybinding) {
      tt.innerHTML += `<span class="keybinding">${keybinding}</span>`;
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
