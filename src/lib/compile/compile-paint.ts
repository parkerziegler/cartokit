function quotePropertyValue(value: string | number) {
	if (typeof value === 'string') {
		return `'${value}'`;
	}

	return `${value}`;
}

export function compilePaint(properties: Record<string, string | number | undefined>): string {
	if (Object.values(properties).every((value) => typeof value === 'undefined')) {
		return '';
	}

	const paint = Object.entries(properties).reduce((p, [key, value], i, arr) => {
		if (typeof value === 'undefined') {
			return p;
		}

		const v = quotePropertyValue(value);

		if (i === arr.length - 1) {
			return p.concat(`'${key}': ${v}\n}`);
		}

		return p.concat(`'${key}': ${v},\n`);
	}, 'paint: {');

	return paint;
}
