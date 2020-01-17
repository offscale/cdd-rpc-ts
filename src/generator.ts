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

function stringToSource(code: string): ts.SourceFile {
  return ts.createSourceFile(
    "someFileName.ts",
    code,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
}

export module Generator {
  export function createModel(model): string {
    // let klass = createClass(name);

    return nodeToString(createClass(model.name));
  }

  export function parseModels(code: string) {
    const options = {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS
    };
    // extract models
    let sourceFile = stringToSource(code);
    var models = [];
    var requests = [];

    ts.forEachChild(sourceFile, function(node: ts.Node) {
      if (ts.isClassDeclaration(node) && node.name) {
        let className = node.name.escapedText;
        models.push({ name: className.toString() });
      }
    });

    return models;
  }
}
