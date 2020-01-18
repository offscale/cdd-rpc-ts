
import fs = require("fs");
import { Project } from "./project";

export module Reader {
  var ts = require('typescript');

  export function listModels(fileName: string) {
    list(true, fileName)
  }
  export function listRequests(fileName: string) {
    list(false, fileName)
  }

  function list(isModel: boolean, fileName: string) {
    const options = {
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS
    }

    const fileNames = [fileName]
    let program = ts.createProgram(fileNames, options);
    const text = fs.readFileSync(fileName, 'utf8');
    var models: Project.Model[] = []
    var requests: Project.Request[] = []

    for (const sourceFile of program.getSourceFiles()) {
      console.log(sourceFile.kind);
      if (sourceFile.kind == ts.SyntaxKind.EnumDeclaration) {
        ts.forEachChild(sourceFile, function (node: ts.Node) {
          if (ts.isClassDeclaration(node) && node.name) {
            var vars = findProperties(node)

            var url = findFuncWithStringReturn("path", text, node)
            const method = findFuncWithStringReturn("method", text, node)
            const respErrorTypes = findResponseErrorTypes(node)

            if (respErrorTypes.length == 2 && url && method) {
              requests.push(new Project.Request(node.name.escapedText.toString(), vars, url.replace("${this.", "{"), method, respErrorTypes[0], respErrorTypes[1]))
            }
            else {
              models.push(new Project.Model(node.name.escapedText.toString(), vars))
            }
          }
        });
      }
    }
    if (isModel) {
      console.log(JSON.stringify(models))
    }
    else {
      console.log(JSON.stringify(requests))
    }

  }

  function findResponseErrorTypes(node: ts.ClassDeclaration): string[] {
    var result = []
    if (node.heritageClauses != undefined) {

      let claus = node.heritageClauses[0]
      if (claus.types != undefined) {
        const l = claus.types[0].expression as ts.Identifier
        if (l.escapedText == "APIRequest") {
          if (claus.types[0].typeArguments.length == 2) {
            const response_type = parseType(claus.types[0].typeArguments[0])
            if (response_type) {
              result.push(response_type)
            }
            const error_type = parseType(claus.types[0].typeArguments[1])
            if (error_type) {
              result.push(error_type)
            }
          }
        }
      }
    }

    return result
  }

  function findFuncWithStringReturn(name: string, wholeText: string, node: ts.ClassDeclaration): string {
    var result: string = undefined
    ts.forEachChild(node, function (node: ts.Node) {
      if (ts.isMethodDeclaration(node)) {
        const func = node as ts.MethodDeclaration
        const fName = node.name as ts.Identifier

        if (fName.escapedText.toString() == name) {
          func.body.statements.forEach((statement) => {
            if (ts.isReturnStatement(statement)) {
              const s = statement as ts.ReturnStatement
              result = wholeText.substring(s.expression.pos + 2, s.expression.end - 1)

              // console.debug(s.expression)
              // if (ts.isStringLiteral(s.expression)) {
              //   const lit = s.expression as ts.StringLiteral
              //   result = lit.text
              // } else 
              // if (ts.isIdentifier(s.expression)) {
              //   const lit = s.expression as ts.Identifier
              //   result = lit.escapedText.toString()
              // }
            }
          })
        }
      }
    })

    return result
  }

  function findProperties(node: ts.Node): Project.Variable[] {
    var vars: Project.Variable[] = []
    ts.forEachChild(node, function (node: ts.Node) {
      if (ts.isPropertyDeclaration(node)) {
        const prop = node as ts.PropertyDeclaration
        if (prop && prop.type) {
          const name = (prop.name as ts.Identifier).escapedText.toString()

          const type = parseType(prop.type)
          const optional = prop.questionToken != undefined

          vars.push(new Project.Variable(name, type, optional))
        }
      }
    })
    return vars
  }

  function parseType(type: ts.TypeNode): string {

    switch (type.kind) {
      case ts.SyntaxKind.StringKeyword: {
        return "String"
      }
      case ts.SyntaxKind.NumberKeyword: {
        return "Float"
      }
      case ts.SyntaxKind.BooleanKeyword: {
        return "Bool"
      }
      case ts.SyntaxKind.TypeReference: {
        const obj = type as ts.TypeReferenceNode
        if (obj != undefined) {
          const ident = (obj.typeName as ts.Identifier)
          if (ident != undefined) {
            return ident.escapedText.toString()
          }
        }
        return ""
      }
      case ts.SyntaxKind.ArrayType: {
        const obj = type as ts.ArrayTypeNode
        if (obj != undefined) {
          return "[" + parseType(obj.elementType) + "]"
        }
        return ""
      }
      default: {
        return ""
      }
    }
  }

}