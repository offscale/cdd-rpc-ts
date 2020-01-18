import ts from "typescript";
import { Project } from "./project";

function typeFor(type: string): ts.TypeNode {
  if (type[0] == "[") {
    return ts.createArrayTypeNode(typeFor(type.substr(1, type.length - 2)));
  }
  if (type == "String") {
    return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
  }
  if (type == "Bool") {
    return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword);
  }
  if (type == "Float") {
    return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword);
  }
  // if (type == "Int") {
  //   return ts.createTypeReferenceNode("Int",[])
  // }

  return ts.createTypeReferenceNode(type, []);
}

function createVar(variable: Project.Variable): ts.PropertyDeclaration {
  const type = typeFor(variable.type);
  return ts.createProperty(
    undefined,
    undefined,
    variable.name,
    undefined,
    type,
    undefined
  );
}

function createClass(
  className: string,
  vars: Project.Variable[]
): ts.ClassDeclaration {
  let varNodes = vars.map(function(variable) {
    return createVar(variable);
  });

  return ts.createClassDeclaration(
    undefined,
    undefined,
    ts.createIdentifier(className),
    undefined,
    undefined,
    // [createVar(new Project.Variable("a", "int", false))]
    varNodes
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
  export function parseProject(code: string) {
    return { models: getModels(code), requests: [] };
  }

  export function createModel(model): string {
    return nodeToString(createClass(model.name, model.vars || []));
  }

  export function parseModels(code: string) {
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

export function getModels(code: string): Project.Model[] {
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
