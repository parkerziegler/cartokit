import tsBlankSpace from 'ts-blank-space';
import { Project, SyntaxKind } from 'ts-morph';

import type { CartoKitBackendAnalysis } from '$lib/types/codegen';
import dbSrc from '$lib/utils/db?raw';

// Create a new project using ts-morph to parse the source code for TypeScript.
const project = new Project({ useInMemoryFileSystem: true });
const tsSourceFile = project.createSourceFile('db.ts', dbSrc);

export function codegenDB(
  language: CartoKitBackendAnalysis['language']
): string {
  // Get the AST nodes for variables and functions we want to incldue in the
  // generated code.
  const astNodes = [
    tsSourceFile.getVariableStatement('MANUAL_BUNDLES'),
    tsSourceFile.getFunction('initDB'),
    tsSourceFile.getFunction('toFeatureCollection')
  ].filter((astNode) => astNode !== undefined);

  // Find the set of identifiers that are actually used by the above AST nodes.
  const identifiers = new Set(
    astNodes.flatMap((astNode) =>
      astNode
        .getDescendantsOfKind(SyntaxKind.Identifier)
        .map((identifier) => identifier.getText())
    )
  );

  // Build the import statements and body of the program.
  const importStatements = tsSourceFile
    .getImportDeclarations()
    .flatMap((importDecl) => {
      const defaultImport = importDecl.getDefaultImport()?.getText();
      const namedImports = importDecl
        .getNamedImports()
        .filter((namedImport) =>
          identifiers.has(
            (namedImport.getAliasNode() ?? namedImport.getNameNode()).getText()
          )
        )
        .map((namedImport) => namedImport.getText());

      const clauses = [
        defaultImport && identifiers.has(defaultImport) ? defaultImport : '',
        namedImports.length > 0 ? `{ ${namedImports.join(', ')} }` : ''
      ].filter(Boolean);

      if (clauses.length === 0) {
        return [];
      }

      return `import ${importDecl.isTypeOnly() ? 'type ' : ''}${clauses.join(', ')} from '${importDecl.getModuleSpecifierValue()}';`;
    })
    .join('\n');
  const body = astNodes.map((astNode) => astNode.getText()).join('\n\n');

  const program = `${importStatements}

${body}`;

  // Use tsBlankSpace to erase type syntax rather than emitting via ts-morph.
  // The latter will strip intentional newlines, harming readability.
  return language === 'typescript' ? program : tsBlankSpace(program);
}
