import type { Attachment } from 'svelte/attachments';

interface SelectTextOptions {
  enable: boolean;
}

export function selectText(
  options: SelectTextOptions
): Attachment<HTMLInputElement> {
  const { enable } = options;

  return (element: HTMLInputElement) => {
    if (enable) {
      element.select();
    }
  };
}
