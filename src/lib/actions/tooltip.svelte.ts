import {
  computePosition,
  offset,
  shift,
  type Placement
} from '@floating-ui/dom';

export function tooltip<T extends HTMLElement>(
  node: T,
  fn: () => { content: string; placement?: Placement }
) {
  $effect(() => {
    const { content, placement = 'top' } = fn();
    const tt = document.createElement('div');
    tt.innerHTML = content;
    tt.style.display = 'none';
    tt.style.position = 'absolute';
    tt.classList.add(
      'tooltip',
      'will-change-transform-opacity',
      'animate-slide-down-and-fade'
    );
    document.body.appendChild(tt);

    function update() {
      computePosition(node, tt, {
        placement,
        middleware: [offset(6), shift({ padding: 8 })]
      }).then(({ x, y }) => {
        Object.assign(tt.style, {
          left: `${x}px`,
          top: `${y}px`
        });
      });
    }

    function showTooltip() {
      tt.style.display = 'block';
      update();
    }

    function hideTooltip() {
      tt.style.display = 'none';
    }

    [
      ['mouseenter', showTooltip],
      ['mouseleave', hideTooltip],
      ['focus', showTooltip],
      ['blur', hideTooltip]
    ].forEach(([event, listener]) => {
      node.addEventListener(
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
        node.removeEventListener(
          event as 'mouseenter' | 'mouseleave' | 'focus' | 'blur',
          listener as EventListener
        );
      });

      tt.remove();
    };
  });
}
