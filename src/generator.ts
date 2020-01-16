import ts from "typescript";

function createClass(name: string): ts.ClassDeclaration {
  // const vars = makeVars(model.vars, false)
  //   return ts.createClassDeclaration(
  //     undefined,
  //     undefined,
  //     name,
  //     undefined,
  //     undefined,
  //     undefined // vars
  //   );

  return ts.createClassDeclaration(
    undefined,
    undefined,
    ts.createIdentifier(name),
    undefined,
    undefined,
    []
  );
}

function nodeToString(node: ts.Node): string {
  const resultFile = ts.createSourceFile(
    "someFileName.ts",
    "",
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result = printer.printNode(ts.EmitHint.Unspecified, node, resultFile);
  return result;
}

export module Generator {
  export function createModel(name: string): string {
    // let klass = createClass(name);

    return nodeToString(createClass(name));
  }

  export function parseModels(code: string): [string] {
    return ["doggo"];
  }
}
