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

  ts.forEachChild(sourceFile, function(node: ts.Node) {
    // if node is a Class,
    if (ts.isClassDeclaration(node) && node.name) {
      // immediately push it (incorrect assumption, need to fix this)
      let className = node.name.escapedText;
      models.push({
        name: className.toString(),
        vars: parseVars(node.getChildren())
      });
    }
  });

  return models;
}

function parseVars(nodes: ts.Node[]) {
  return [];
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
