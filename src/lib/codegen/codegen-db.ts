import tsBlankSpace from 'ts-blank-space';
import { Project } from 'ts-morph';

import dbSrc from '$lib/utils/db?raw';
import type { CartoKitBackendAnalysis } from '$lib/types/codegen';

// Create a new project using ts-morph to parse the source code for TypeScript.
const project = new Project({ useInMemoryFileSystem: true });
const tsSourceFile = project.createSourceFile('db.ts', dbSrc);

/**
 * Determine whether an identifier is referenced in a program fragment.
 *
 * @param name The identifier.
 * @param text The program fragment.
 * @returns Whether the identifier is referenced.
 */
function isReferenced(name: string, text: string): boolean {
  return new RegExp(`\\b${name}\\b`).test(text);
}

export function codegenDB(
  language: CartoKitBackendAnalysis['language']
): string {
  const body = [
    tsSourceFile.getVariableStatement('MANUAL_BUNDLES')?.getText() ?? '',
    tsSourceFile.getFunction('initDB')?.getText() ?? '',
    tsSourceFile.getFunction('toFeatureCollection')?.getText() ?? ''
  ].join('\n\n');

  // Keep only the imports referenced by the generated module, since the
  // generated tsconfig.json enables noUnusedLocals.
  const importStatements = tsSourceFile
    .getImportDeclarations()
    .flatMap((importDecl) => {
      const defaultImport = importDecl.getDefaultImport()?.getText();
      const namedImports = importDecl
        .getNamedImports()
        .filter((namedImport) =>
          isReferenced(namedImport.getNameNode().getText(), body)
        )
        .map((namedImport) => namedImport.getText());
      const clauses = [
        defaultImport && isReferenced(defaultImport, body) ? defaultImport : '',
        namedImports.length > 0 ? `{ ${namedImports.join(', ')} }` : ''
      ].filter(Boolean);

      if (clauses.length === 0) {
        return [];
      }

      return `import ${importDecl.isTypeOnly() ? 'type ' : ''}${clauses.join(', ')} from '${importDecl.getModuleSpecifierValue()}';`;
    })
    .join('\n');

  const program = `${importStatements}

${body}`;

  // Erase type syntax for JavaScript rather than emitting through the
  // TypeScript compiler, which strips blank lines. Prettier cleans up the
  // whitespace left behind.
  return language === 'typescript' ? program : tsBlankSpace(program);
}
