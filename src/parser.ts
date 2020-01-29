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
          var name, ty;

          if (ts.isIdentifier(node.name)) {
            console.log("####", node.name.escapedText);
            name = node.name.escapedText;
          }

          if (ts.isTypeReferenceNode(node.type)) {
            if (ts.isIdentifier(node.type.typeName)) {
              console.log(">>>>", node.type.typeName.escapedText);
              ty = node.type.typeName.escapedText;
            }
          }

          if (node.type.kind == SyntaxKind.StringKeyword) {
            ty = "string";
          }

          // if ts.isTypeReferenceNode(node.type) {
          //   console.log("type: ", node.type.get)
          // }

          // console.log(node.name);
          // node.name.getText();
          vars.push(new Project.Variable(name, ty, false, null));
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
