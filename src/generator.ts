import ts, { ModuleResolutionKind } from "typescript";
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
  let varNodes = vars.map(variable => {
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
  params: Project.Variable[],
  variables: Project.Variable[]
): ts.FunctionDeclaration {
  return ts.createFunctionDeclaration(
    undefined,
    undefined,
    undefined,
    fnName,
    undefined,
    variablesToFunctionParams(params),
    undefined,
    ts.createBlock(createVariableDeclarations(variables), true)
  );
}

function createVariableDeclarations(variables: Project.Variable[]) {
  console.log(variables);
  return variables.map(variable => {
    return createVariableDeclaration(
      variable.name,
      variable.type,
      variable.value
    );
  });
}

function createVariableDeclaration(varName, varType, varValue) {
  return ts.createVariableStatement(
    undefined,
    ts.createVariableDeclarationList(
      [
        ts.createVariableDeclaration(
          ts.createIdentifier(varName),
          ts.createTypeReferenceNode(ts.createIdentifier(varType), undefined),
          ts.createStringLiteral(varValue)
        )
      ],
      ts.NodeFlags.None
    )
  );
}

function variablesToFunctionParams(
  variables: Project.Variable[]
): ts.ParameterDeclaration[] {
  return variables.map(variable => {
    return variableToFunctionParams(variable);
  });
}

function variableToFunctionParams(
  variable: Project.Variable
): ts.ParameterDeclaration {
  return ts.createParameter(
    undefined,
    undefined,
    undefined,
    ts.createIdentifier(variable.name),
    undefined,
    ts.createTypeReferenceNode(ts.createIdentifier(variable.type), undefined),
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
    console.log(request);
    let req = new Project.Variable("method", "String", false, request.method);
    let path = new Project.Variable("path", "String", false, request.path);

    return nodeToString(
      createFunction(request.name, request.params || [], [req, path])
    );
  }

  export function createCode(models: any[], requests: any[]): string {
    return "ccccoooodeeeee";
  }
}
