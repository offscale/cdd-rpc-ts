import { Project } from "./project";
import ts, { isIdentifier, SyntaxKind } from "typescript";

export function parseProject(code: string) {
  return { models: extractModels(code), requests: extractRequests(code) };
}

function extractModels(code: string): Project.Model[] {
  // extract models
  let sourceFile = stringToSource(code);
  var models = [];

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

// todo: skip double parsing, refactor
function extractRequests(code: string) {
  // extract models
  let sourceFile = stringToSource(code);
  var requests = [];

  ts.forEachChild(sourceFile, (node: ts.Node) => {
    // if node is a fn,
    if (ts.isFunctionDeclaration(node)) {
      const func = node as ts.FunctionDeclaration;
      const fnName = node.name as ts.Identifier;

      requests.push({
        name: fnName.escapedText.toString(),
        path: extractVariable(func, "path"),
        params: extractParams(func),
        method: extractVariable(func, "method"),
        response_type: "response",
        error_type: "error"
      });
    }
  });

  return requests;
}

function extractVariable(
  func: ts.FunctionDeclaration,
  varName: string
): string {
  if (func.body == null) {
    return null;
  }
  let pathVar = findVariable(func.body, varName);

  if (pathVar && pathVar.value) {
    return pathVar.value;
  }

  return null;
}

function findVariable(fnBody: ts.FunctionBody, name: string) {
  var variable;

  fnBody.statements.forEach((statement: ts.Statement) => {
    if (ts.isVariableStatement(statement)) {
      statement.declarationList.declarations.forEach(declaration => {
        if (ts.isVariableDeclaration(declaration)) {
          const varName = declaration.name as ts.Identifier;
          const varType = declaration.type.kind as ts.SyntaxKind;
          const varValue = declaration.initializer as ts.StringLiteral;

          if (varName && varType && varValue && varName.escapedText == name) {
            variable = {
              name: varName.escapedText.toString(),
              type: varType.toString(),
              value: varValue.text
            };
          }
        }
      });
    }
  });
  return variable;
}

function extractParams(node: ts.Node) {
  let params = [];

  ts.forEachChild(node, node => {
    if (ts.isParameter(node)) {
      let param = extractParam(node);
      if (param != null) {
        params.push(param);
      }
    }
  });

  return params;
}

function extractParam(node: ts.ParameterDeclaration) {
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

  if (name != null && ty != null) {
    return {
      name: name,
      type: ty,
      optional: false,
      value: null
    };
  }

  return null;
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
