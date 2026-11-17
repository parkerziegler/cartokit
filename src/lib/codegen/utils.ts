const DEFAULTS = {
  bearing: 0,
  'circle-color': '#000000',
  'circle-radius': 5,
  'circle-opacity': 1,
  'circle-stroke-color': '#000000',
  'circle-stroke-opacity': 1,
  'circle-stroke-width': 0,
  'fill-color': '#000000',
  'fill-opacity': 1,
  'heatmap-intensity': 1,
  'heatmap-opacity': 1,
  'heatmap-radius': 30,
  'line-color': '#000000',
  'line-opacity': 1,
  'line-width': 1,
  pitch: 0
};

/**
 * Return a program fragment for a JavaScript literal, with strings quoted and
 * escaped.
 *
 * @param value A JSON-serializable value.
 * @returns A program fragment containing the literal.
 */
export function literal(value: unknown): string {
  return JSON.stringify(value);
}

/**
 * Return a program fragment representing a property-value pair.
 *
 * @param property The property name.
 * @param value The JSON-serializable value of the property.
 * @returns A program fragment.
 */
export function prop(property: string, value: unknown): string {
  return `${literal(property)}: ${literal(value)}`;
}

/**
 * Join property-value pairs into a program fragment for the body of an object
 * literal, skipping empty fragments.
 *
 * @param fragments The (potentially empty) program fragments of each property.
 * @returns A (potentially empty) program fragment.
 */
export function props(...fragments: string[]): string {
  return fragments.filter(Boolean).join(',\n');
}

/**
 * Return a program fragment representing a property-value pair,
 * unless the value is the same as the default value.
 *
 * @param property The property name.
 * @param cartokitValue The value of the property in the {@link CartoKitIR}.
 * @returns A (potentially empty) program fragment.
 */
export function withDefault<T extends string | number>(
  property: keyof typeof DEFAULTS,
  cartokitValue: T
): string {
  return cartokitValue !== DEFAULTS[property]
    ? prop(property, cartokitValue)
    : '';
}

/**
 * Erase all type syntax from a TypeScript program, producing the equivalent
 * JavaScript program.
 *
 * @param program The TypeScript program text.
 * @returns A Promise resolving to the JavaScript program text.
 */
export async function eraseTypes(program: string): Promise<string> {
  // Loaded lazily since it pulls in the TypeScript parser, which is only
  // needed for the JavaScript backend.
  const { default: tsBlankSpace } = await import('ts-blank-space');

  return tsBlankSpace(program, (node) => {
    throw new Error(
      `Generated program contains TypeScript syntax that cannot be erased: ${node.getText()}`
    );
  });
}
