import type { CartoKitBackend } from '$lib/types/codegen';

/**
 * Codegen Vite's basic HTML template.
 *
 * @returns The basic HTML file for cartokit's starter code.
 */
export function codegenHTML(language: CartoKitBackend['language']) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>cartokit Map</title>
  </head>
  <body>
    <div id="map"></div>
    <script type="module" src="/src/index.${language === 'typescript' ? 'ts' : 'js'}"></script>
  </body>
</html>
`;
}
