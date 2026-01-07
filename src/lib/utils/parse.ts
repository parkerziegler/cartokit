import { Project, ScriptTarget } from 'ts-morph';

import type { Transformation, TransformationKind } from '$lib/types';

/**
 * Parse a string of TypeScript code into a transformation.
 *
 * @param sourceCode The string of TypeScript code to parse.
 * @param name The name of the {@link Transformation} to parse.
 * @param kind The type of the {@link Transformation}, either 'geometric' or
 * 'tabular'.
 *
 * @returns A {@link Transformation}.
 */
export function parseStringToTransformation(
  sourceCode: string,
  kind: TransformationKind,
  name?: string
): Transformation {
  // Create a new project using ts-morph to parse the source code for TypeScript.
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: ScriptTarget.ESNext,
      removeComments: false
    }
  });
  const tsSourceFile = project.createSourceFile('tmp.ts', sourceCode);

  // Get the function in the source file with the given name,
  // or the first function if no name is provided.
  const fnTs = name
    ? tsSourceFile.getFunctions().find((fn) => fn.getName() === name)!
    : tsSourceFile.getFunctions()[0];

  // Get the body of the function.
  const definitionTS = fnTs.getBody()?.getText() ?? '';

  let definitionJS = '';

  // Now, get the emitted JavaScript code.
  const emitOutput = tsSourceFile.getEmitOutput();

  // Load the emit output into a new project.
  // See: https://ts-morph.com/emitting#emitting-to-memory
  const projectJS = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      target: ScriptTarget.ESNext,
      removeComments: false
    }
  });

  for (const file of emitOutput.getOutputFiles()) {
    const path = file.getFilePath();

    projectJS.createSourceFile(path, file.getText(), {
      overwrite: true
    });

    // Get the function from the JavaScript file.
    const fnJs = projectJS.getSourceFile(path)?.getFunctions()[0];
    definitionJS = fnJs?.getBody()?.getText() ?? '';
  }

  return {
    name: fnTs.getName() ?? 'anonymous',
    params: fnTs.getParameters().map((param) => param.getName()),
    paramTypes: fnTs
      .getParameters()
      .map(
        (param) => param.getTypeNode()?.getText() ?? param.getType().getText()
      ),
    returnType: fnTs.getReturnType()?.getText() ?? '',
    definitionTS,
    definitionJS,
    kind
  };
}
