import * as Comlink from 'comlink';
import type { FeatureCollection } from 'geojson';
import { parse, visit, print } from 'recast';

interface Import {
  specifier: string;
  moduleName: string;
}

export interface TransformationWorkerReturnValue {
  logs: unknown[];
  data: FeatureCollection;
  functionName: string;
}

/**
 * Execute a user-defined transformation in a Web Worker. This function is
 * wrapped by Comlink to support RPC from the main thread.
 *
 * Note: This function operates on the AST of the user-defined transformation to:
 *
 * 1. Identify all imported modules used in the transformation and dynamically
 *    load them.
 * 2. Identify the name of the transformation function.
 * 3. Rewrite the program to a single function call, with all dynamically import-
 *    ed modules brought into scope.
 *
 * @param program — The user-defined transformation, represented as a string.
 * @param data — The GeoJSON data of the current layer.
 *
 * @returns — An object containing the logs, the transformed data, and the name
 * of the transformation function.
 * */
async function executeUserTransformation(
  program: string,
  data: FeatureCollection
): Promise<TransformationWorkerReturnValue> {
  const ast = parse(program);
  const imports: Import[] = [];
  let functionName = '';

  // Visit all import declarations and collect the specifier and module name.
  // Additionally, remove the import declarations from the AST.
  visit(ast, {
    visitImportDeclaration(path) {
      const specifier = path.node.specifiers?.[0].local?.name.toString() ?? '';
      const moduleName = path.node.source.value?.toString() ?? '';
      imports.push({ specifier, moduleName });

      path.prune();

      return false;
    },
    visitExportNamedDeclaration(path) {
      if (path.node.declaration?.type === 'FunctionDeclaration') {
        functionName = path.node.declaration.id?.name.toString() ?? '';

        path.replace(path.node.declaration);
      }

      return false;
    }
  });

  const code = print(ast).code;

  // Dynamically import requested libraries
  const importedModules = await Promise.all(
    imports.map(({ moduleName }) =>
      import(moduleName).then((module) => module.default || module)
    )
  );

  // Create a function from the user's code
  const fn = new Function(
    ...imports.map(({ specifier }) => specifier),
    'data',
    `
      const logs = [];
      (${interceptConsoleInWebWorker.toString()})(logs);

      ${code}
      
      return {
        logs,
        data: ${functionName}(data),
        functionName: '${functionName}'
      }
    `
  );

  return fn(...importedModules, data);
}

/**
 * Intercept console.log calls in a Web Worker and push them to a buffer.
 * @param buffer - The buffer to push console.log arguments to.
 */
function interceptConsoleInWebWorker(buffer: unknown[]): void {
  const log = console.log.bind(console);

  console.log = (...args) => {
    buffer.push(...args);
    log(...args);
  };
}

Comlink.expose(executeUserTransformation);
