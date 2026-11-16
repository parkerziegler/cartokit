import { dependencies, devDependencies } from '../../../package.json';

import type { CartoKitBackendAnalysis } from '#lib/types/codegen.ts';

// mapbox-gl is not a cartokit dependency, so Renovate keeps this version
// current via the custom manager in renovate.json.
// renovate: datasource=npm depName=mapbox-gl
const MAPBOX_GL_VERSION = '3.35.0';

const versions = {
  ...dependencies,
  ...devDependencies,
  'mapbox-gl': `^${MAPBOX_GL_VERSION}`
};

/** Represents the string union of all cartokit dependency names. */
type PackageName = keyof typeof versions;

/**
 * Select the packages to include in the generated package.json, paired with
 * their versions.
 *
 * @param include A partial dictionary mapping package names to Boolean
 * conditions indicating whether or not they're included in the generated code.
 * @returns A dictionary mapping the names of included packages to their
 * versions.
 */
function packages(
  include: Partial<Record<PackageName, boolean>>
): Partial<Record<PackageName, string>> {
  return Object.fromEntries(
    Object.entries(include)
      .filter(([, isIncluded]) => isIncluded)
      .map(([name]) => [name, versions[name as PackageName]])
  );
}

/**
 * Generate the package.json file for a cartokit project.
 *
 * @param analysis The current {@link CartoKitBackendAnalysis}.
 * @returns The generated program string for the package.json file.
 */
export function codegenPackageJson(analysis: CartoKitBackendAnalysis) {
  const isTypeScript = analysis.language === 'typescript';

  return JSON.stringify(
    {
      name: 'cartokit-project',
      private: true,
      version: '0.0.0',
      type: 'module',
      scripts: {
        dev: 'vite',
        build: `${isTypeScript ? 'tsc && ' : ''}vite build`,
        preview: 'vite preview'
      },
      dependencies: packages({
        '@duckdb/duckdb-wasm': analysis.isDuckDBRequired,
        'mapbox-gl': analysis.library === 'mapbox',
        'maplibre-gl': analysis.library === 'maplibre',
        pmtiles: analysis.isPMTilesRequired
      }),
      devDependencies: packages({
        '@types/geojson': analysis.isDuckDBRequired && isTypeScript,
        typescript: isTypeScript,
        vite: true
      })
    },
    null,
    2
  );
}
