import {Project} from "./project";
import ts, { SyntaxKind } from "typescript";

export function parseProject(code: string) {
  return { models: extractModels(code), requests: extractRequests(code) };
}

function extractModels(code: string): { name: string, vars: Project.BaseVariable[]}[] {
  // extract models
  let sourceFile = serialise(code);
  const models: {
    name: string,
    vars: Project.BaseVariable[]}[] = [];

  ts.forEachChild(sourceFile, (node: ts.Node) => {
    // if node is a Class,
    if (ts.isClassDeclaration(node) && node.name) {
      // immediately push it (incorrect assumption, need to fix this)

      let className = node.name.escapedText;
      let vars: Array<Project.BaseVariable> = [];

      ts.forEachChild(node, (node: ts.Node) => {
        // looking for variables...

        if (ts.isPropertyDeclaration(node) && node.name) {
          let name: string|null = null, ty: string|null = null;

          // get name
          if (ts.isIdentifier(node.name)) {
            name = node.name.escapedText.toString();
          }

          // check for complex types
          if (ts.isTypeReferenceNode(node.type!)) {
            if (ts.isIdentifier(node.type.typeName)) {
              ty = node.type.typeName.escapedText.toString();
            }
          }

          // check for simple types
          if (node.type!.kind == SyntaxKind.StringKeyword) {
            ty = "String";
          }

          if (name != null && ty != null) {
            vars.push({
              name: name,
              type: ty,
              optional: false,
              value: undefined
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
function extractRequests(code: string): Array<Project.Request> {
  // extract models
  let sourceFile = serialise(code);
  let requests: Array<Project.Request> = [];

  ts.forEachChild(sourceFile, (node: ts.Node) => {
    // if node is a fn,
    if (ts.isFunctionDeclaration(node)) {
      const func = node as ts.FunctionDeclaration;
      const fnName = node.name as ts.Identifier;

      requests.push(<Project.Request>{
        name: fnName.escapedText.toString(),
        path: extractVariable(func, "path")!,
        vars: extractParams(func)!,
        method: extractVariable(func, "method")!,
        response_type: "response",
        error_type: "error",
      });
    }
  });

  return requests;
}

function extractVariable(
  func: ts.FunctionDeclaration,
  varName: string
): string|null {
  if (func.body == null) {
    return null;
  }
  let pathVar = findVariable(func.body, varName);

  if (pathVar && pathVar.value) {
    return pathVar.value;
  }

  return null;
}

function findVariable(fnBody: ts.FunctionBody, name: string): Project.BaseVariable|null {
  let variable: Project.BaseVariable|null = null;

  fnBody.statements.forEach((statement: ts.Statement) => {
    if (ts.isVariableStatement(statement)) {
      statement.declarationList.declarations.forEach(declaration => {
        if (ts.isVariableDeclaration(declaration) && declaration.type != null) {
          const varName = declaration.name as ts.Identifier;
          const varType = declaration.type.kind as ts.SyntaxKind;
          const varValue = declaration.initializer as ts.StringLiteral;

          if (varName && varType && varValue && varName.escapedText == name) {
            variable = {
              name: varName.escapedText.toString(),
              type: varType.toString(),
              value: varValue.text,
              optional: true
            };
          }
        }
      });
    }
  });
  return variable;
}

function extractParams(node: ts.Node): Project.BaseVariable[] {
  const params: Project.BaseVariable[] = [];

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

function extractParam(node: ts.ParameterDeclaration): Project.BaseVariable | undefined {
  let name: string|null=null, ty: string|null=null;

  // get name
  if (ts.isIdentifier(node.name)) {
    name = node.name.escapedText.toString();
  }

  if (node.type == null)
    return undefined;

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
      value: undefined
    };
  }

  return undefined;
}

export function serialise(code: string): ts.SourceFile {
  return ts.createSourceFile(
    "someFileName.ts",
    code,
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );
}

export function deserialise(ast: ts.Node): string {
  const resultFile = ts.createSourceFile(
    'test.ts',
    '',
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS,
  );

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  return printer.printNode(
    ts.EmitHint.Unspecified,
    ast,
    resultFile,
  );
}
