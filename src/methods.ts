import { Generator } from "./generator";
import * as Parser from "./parser";
import { Params } from "./defintions";
import ts from "typescript";
import {Project} from "./project";

interface IParams {
  code: string;
  ast: ts.SourceFile;
}

type IReply<T> = (eventName: string|null, response: T) => void

// RPC CALL: serialise
// generate code from adt
export function serialise(params: IParams, reply: IReply<{ ast: ts.SourceFile, formattedCode: string }>) {
  console.log("-> serialise: ", params);

  // let ast = Parser.stringToSource(params.code);

  // console.log("<- serialise: ", JSON.stringify(ast.statements, null, '\t'));
  // reply(null, { ast: ast.statements, formattedCode:  });

  let ast = Parser.serialise(params.code);
  reply(null, { ast: ast, formattedCode: Parser.deserialise(ast) });
}

// RPC CALL: deserialise
// generate code from adt
export function deserialise(params: IParams, reply: IReply<{ code: string }>) {
  console.log("-> deserialise: ", params);

  let code = Parser.deserialise(params.ast);

  console.log("<- deserialise: ", { code: code });
  reply(null, { code: code });
}

// RPC CALL: generate
// generate code from adt
export function generate(params: Params<string[]>, reply: IReply<{code: string}>) {
  console.log("generate -> params:", params);

  let models = params["models"]
    .map((model_name: string) => {
      return Generator.createModel({name: model_name, vars: []});
    })
    .join("\n\n");

  reply(null, { code: models });
}

// RPC CALL: parse
// parse code into adt
export function parse(params: Params<string>, reply: IReply<{project: {models: { name: string, vars: Project.BaseVariable[]}[], requests: Project.Request[]}}>) {
  console.log("-> parse:", params);
  let project = Parser.parseProject(params["code"]);
  // console.log(`  result: ${project}`);
  console.log("<- parse response:", project);
  reply(null, { project: project });
}

// RPC CALL: update
// update code from adt
export function update(params: Params<{models: string[], requests: string[]}>, reply: IReply<{ code: string }>) {
  console.log("-> update:", params);
  let { models, requests } = params["project"];
  // let code_project = extractProject(params["code"]);

  const code: string[] = [];

  for (let model of (models as any as Project.Model[])) {
    code.push(Generator.createModel(model));
  }

  for (let request of (requests as any as { params: Project.Variable[]; path: string; method: string; name: string; }[])) {
    code.push(Generator.createRequest(request));
  }

  reply(null, {
    code: code.join("\n\n")
  });
}
