export function isPropertyNumeric(property: unknown): property is number {
	if (typeof property === 'string') {
		return !Number.isNaN(+property);
	}

	return !Number.isNaN(property);
}
