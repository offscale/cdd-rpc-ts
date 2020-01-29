import { Project } from "./project";
import ts from "typescript";

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
        parseVars(node);
      });

      models.push({
        name: className.toString(),
        vars: vars
      });
    }
  });

  return models;
}

function parseVars(node: ts.Node) {
  var vars = [];

  if (ts.isVariableDeclaration(node) && node.name) {
    vars.push(name: node.name);
  }
  return vars;
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
