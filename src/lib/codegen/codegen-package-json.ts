import { dependencies, devDependencies } from '../../../package.json';

import type { CartoKitBackendAnalysis } from '$lib/types/codegen';

// mapbox-gl is not a cartokit dependency, so Renovate keeps this version
// current via the custom manager in renovate.json.
// renovate: datasource=npm depName=mapbox-gl
const MAPBOX_GL_VERSION = '3.30.0';

const versions = {
  ...dependencies,
  ...devDependencies,
  'mapbox-gl': `^${MAPBOX_GL_VERSION}`
};

type PackageName = keyof typeof versions;

type JSONValue = string | boolean | JSONEntry[];

interface JSONEntry {
  key: string;
  value: JSONValue;
}

/**
 * Write a single key-value {@link JSONEntry}, recursing on Array-valued values.
 *
 * @param entry A key-value {@link JSONEntry}.
 * @returns A string for a key-value {@link JSONEntry}.
 */
function writeJSONEntry(entry: JSONEntry): string {
  const serialized = Array.isArray(entry.value)
    ? `{\n${entry.value.map(writeJSONEntry).join(',')}\n}`
    : JSON.stringify(entry.value);

  return `${JSON.stringify(entry.key)}: ${serialized}`;
}

/**
 * Convert a dictionary of packages to an Array of {@link JSONEntry} values.
 *
 * @param include A partial dictionary mapping package names to Boolean
 * conditions indicating whether or not they're included in the generated code.
 * @returns A list of {@link JSONEntry} values representing packages to include
 * in the generated package.json.
 */
function packages(include: Partial<Record<PackageName, boolean>>): JSONEntry[] {
  return Object.entries(include)
    .filter(([, isIncluded]) => isIncluded)
    .map(([key]) => ({ key, value: versions[key as PackageName] }));
}

/**
 * Generate the package.json file for a cartokit project.
 *
 * @param analysis The current {@link CartoKitBackendAnalysis}.
 * @returns The generated program string for the package.json file.
 */
export function codegenPackageJson(analysis: CartoKitBackendAnalysis) {
  const isTypeScript = analysis.language === 'typescript';

  const json: JSONEntry[] = [
    { key: 'name', value: 'cartokit-project' },
    { key: 'private', value: true },
    { key: 'version', value: '0.0.0' },
    { key: 'type', value: 'module' },
    {
      key: 'scripts',
      value: [
        { key: 'dev', value: 'vite' },
        { key: 'build', value: `${isTypeScript ? 'tsc && ' : ''}vite build` },
        { key: 'preview', value: 'vite preview' }
      ]
    },
    {
      key: 'dependencies',
      value: packages({
        '@turf/turf': analysis.isTurfRequired,
        'mapbox-gl': analysis.library === 'mapbox',
        'maplibre-gl': analysis.library === 'maplibre',
        pmtiles: analysis.isPMTilesRequired
      })
    },
    {
      key: 'devDependencies',
      value: packages({
        '@types/geojson': analysis.isFetchGeoJSONRequired && isTypeScript,
        typescript: isTypeScript,
        vite: true
      })
    }
  ];

  return `{${json.map(writeJSONEntry).join(',')}}`;
}
