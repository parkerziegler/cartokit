/**
 * Minimal type declarations for Observable's Inspector.
 * See: https://github.com/observablehq/inspector/blob/main/src/index.js
 */
declare module '@observablehq/inspector' {
  export class Inspector {
    constructor(node: Node);

    fulfilled(value: unknown): void;
  }
}
