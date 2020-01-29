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

function createFunction(
  fnName: string,
  params: Project.Variable[]
): ts.FunctionDeclaration {
  return ts.createFunctionDeclaration(
    undefined,
    undefined,
    undefined,
    fnName,
    undefined,
    [],
    undefined,
    undefined
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
  export function createModel(model): string {
    return nodeToString(createClass(model.name, model.vars || []));
  }

  export function createRequest(request): string {
    return nodeToString(createFunction(request.name, request.params || []));
  }

  export function createCode(models: any[], requests: any[]): string {
    return "ccccoooodeeeee";
  }
}
