import { Project } from "./project";
import ts, { isIdentifier, SyntaxKind } from "typescript";

export function parseProject(code: string) {
  return { models: parseModels(code), requests: [] };
}

function parseModels(code: string): Project.Model[] {
  // extract models
  let sourceFile = stringToSource(code);
  var models = [];
  var requests = [];

  ts.forEachChild(sourceFile, (node: ts.Node) => {
    // if node is a Class,
    if (ts.isClassDeclaration(node) && node.name) {
      // immediately push it (incorrect assumption, need to fix this)

      let className = node.name.escapedText;
      let vars = [];

      ts.forEachChild(node, (node: ts.Node) => {
        // looking for variables...

        if (ts.isPropertyDeclaration(node) && node.name) {
          var name: string, ty: string;

          // get name
          if (ts.isIdentifier(node.name)) {
            name = node.name.escapedText.toString();
          }

          // check for complex types
          if (ts.isTypeReferenceNode(node.type)) {
            if (ts.isIdentifier(node.type.typeName)) {
              ty = node.type.typeName.escapedText.toString();
            }
          }

          // check for simple types
          if (node.type.kind == SyntaxKind.StringKeyword) {
            ty = "String";
          }

          console.log(name, ty);
          if (name != null && ty != null) {
            vars.push({
              name: name,
              type: ty,
              optional: false,
              value: null
            });
          }
        }
      });

      models.push({
        name: className.toString(),
        vars: vars
      });
    }
  });

  return models;
}

function parseVar(node: ts.Node) {}

function stringToSource(code: string): ts.SourceFile {
  return ts.createSourceFile(
    "someFileName.ts",
    code,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
}
