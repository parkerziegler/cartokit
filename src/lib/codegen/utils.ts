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
    ? `'${property}': ${
        typeof cartokitValue === 'string' ? `'${cartokitValue}'` : cartokitValue
      }`
    : '';
}
