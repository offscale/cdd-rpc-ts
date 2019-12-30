import ts from "typescript";
import fs = require("fs");
import { Project } from "./project";
import { type } from "os";

export module Writer {

    export function insertRequest(request: Project.Request, fileName: string) {
      var resStatements: ts.Statement[] = []
      const file = sourceFile(fileName)
      file.statements.forEach(function(statement) {
        resStatements.push(statement)  
      });
      
      const decl = makeRequest(request)
      resStatements.push(decl) 
      const newFile = ts.updateSourceFileNode(file,resStatements)
      write(fileName,newFile)
    }

    export function insertModel(model: Project.Model, fileName: string) {
      var resStatements: ts.Statement[] = []
      const file = sourceFile(fileName)
      file.statements.forEach(function(statement) {
        resStatements.push(statement)  
      });
      
      const decl = makeModel(model)
      resStatements.push(decl) 
      const newFile = ts.updateSourceFileNode(file,resStatements)
      write(fileName,newFile)
    }

    export function updateRequest(request: Project.Request, fileName: string) {
      var resStatements: ts.Statement[] = []
      const file = sourceFile(fileName)
      const decl = makeRequest(request)
      file.statements.forEach(function(statement) {
        const cl = statement as ts.ClassDeclaration
        if (cl && cl.name.escapedText == request.name) {
          resStatements.push(decl)    
        }
        else {
          resStatements.push(statement)  
        }
      });
      
      const newFile = ts.updateSourceFileNode(file,resStatements)
      write(fileName,newFile)
    }
    export function updateModel(model: Project.Model, fileName: string) {
      
      var resStatements: ts.Statement[] = []
      const file = sourceFile(fileName)
      const decl = makeModel(model)
      file.statements.forEach(function(statement) {
        const cl = statement as ts.ClassDeclaration
        if (cl && cl.name.escapedText == model.name) {
          resStatements.push(decl)    
        }
        else {
          resStatements.push(statement)  
        }
      });
      
      const newFile = ts.updateSourceFileNode(file,resStatements)
      write(fileName,newFile)
    }

    export function deleteClass(name: string, fileName) {
      var resStatements: ts.Statement[] = []
      const file = sourceFile(fileName)
      file.statements.forEach(function(statement) {
        const cl = statement as ts.ClassDeclaration
        if (cl && cl.name.escapedText == name) {
   
        }
        else {
          resStatements.push(statement)  
        }
      });
      
      const newFile = ts.updateSourceFileNode(file,resStatements)
      write(fileName,newFile)
    }

    function sourceFile(fileName: string): ts.SourceFile {
      const fileNames = [fileName]
      const text = fs.readFileSync(fileName,'utf8');
      return ts.createSourceFile(fileName,text,ts.ScriptTarget.Latest,false,ts.ScriptKind.TS)
    }

    function write(fileName: string, file:ts.SourceFile) {
        const printer = ts.createPrinter({
            newLine: ts.NewLineKind.LineFeed
          });
          
          const result = printer.printNode(
            ts.EmitHint.Unspecified,
            file,
            file
          );
          fs.writeFile(fileName,result,(err) => {})
    }

    function makeModel(model: Project.Model): ts.ClassDeclaration {    
        const vars = makeVars(model.vars, false)
        
        return ts.createClassDeclaration(undefined,undefined,model.name,undefined,undefined,vars)
      }
      
    function makeRequest(request: Project.Request): ts.ClassDeclaration { 
        const vars = makeVars(request.vars, true)
        
        const stringType = ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
        const methodBody = ts.createBlock(
          [ts.createReturn(ts.createLiteral(request.method))],
          /*multiline*/ true
        );
        const method = ts.createMethod(undefined,undefined,undefined,"method",undefined,undefined,[],stringType,methodBody)
      
        
        const urlString = request.path.replace("{","${this.")
        const url = ts.createIdentifier("`" + urlString + "`")
        const urlBody = ts.createBlock(
          [ts.createReturn(url)],
          /*multiline*/ true
        );
        const path = ts.createMethod(undefined,undefined,undefined,"path",undefined,undefined,[],stringType,urlBody)
      
        vars.push(method)
        vars.push(path)
        const extendTypes = [typeFor(request.response_type),typeFor(request.error_type)]
        const type = ts.createExpressionWithTypeArguments(extendTypes,ts.createIdentifier("APIRequest"))
        const hertiage = ts.createHeritageClause(ts.SyntaxKind.ExtendsKeyword,[type])
        return ts.createClassDeclaration(undefined,undefined,request.name,undefined,[hertiage],vars)
      }
      
      function makeVars(variables: Project.Variable[], needSuper: boolean) : ts.ClassElement[] {
          let parameters = variables.map(function(variable){
              return makeParameter(variable)
          })
      
          
          let vars: any[] = variables.map(function(variable){
              return makeVar(variable)
          })
      
          const superCall = ts.createCall(ts.createSuper(), /*typeArgs*/ undefined, [])
          var superCallArr = needSuper ? [ts.createStatement(superCall)] : []
          const constructorBody = ts.createBlock(
            superCallArr,
              /*multiline*/ true
            );

          const constructor = ts.createConstructor(undefined,undefined,parameters,constructorBody)
          vars.push(constructor)
          
          return vars
      }
      
      function makeParameter(variable:Project.Variable): ts.ParameterDeclaration {
        const paramType = typeFor(variable.type)
        return ts.createParameter(undefined,undefined,undefined,variable.name,undefined,paramType,undefined)
      }

      function typeFor(type:string): ts.TypeNode {
        if (type[0] == "[") {
          return ts.createArrayTypeNode(typeFor(type.substr(1,type.length - 2)))
        }

        if (type == "String") {
          return ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
        }
        if (type == "Bool") {
          return ts.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
        }
        if (type == "Float") {
          return ts.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
        }
        // if (type == "Int") {
        //   return ts.createTypeReferenceNode("Int",[])
        // }

        return ts.createTypeReferenceNode(type,[])
      }
      
      function makeVar(variable:Project.Variable): ts.PropertyDeclaration {
          const type = typeFor(variable.type)
          return ts.createProperty(undefined,undefined,variable.name,undefined,type,undefined)
      
      }
}