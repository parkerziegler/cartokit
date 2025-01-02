import { parse, visit, print } from 'recast';

/**
 * Parse a user-defined transformation and return the function name and body.
 *
 * @param transformation - The user-defined transformation.
 * @returns – An Object containing the function name and body.
 */
export function parseUserDefinedTransformation(transformation: string) {
  const ast = parse(transformation);
  let functionName = '';
  let functionBody = '';

  visit(ast, {
    visitFunctionDeclaration(path) {
      functionName = path.node.id?.name.toString() ?? '';
      functionBody = print(path.node.body).code.replace(/^{|}$/g, '');

      return false;
    }
  });

  return {
    functionName,
    functionBody
  };
}
