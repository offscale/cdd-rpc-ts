import { Generator } from "./generator";
import * as Parser from "./parser";

// RPC CALL: generate
// generate code from adt
export function generate(params, reply) {
  console.log("generate -> params: ", params);

  let models = params["models"]
    .map((model: string) => {
      return Generator.createModel(model);
    })
    .join("\n\n");

  reply(null, { code: models });
}

// RPC CALL: parse
// parse code into adt
export function parse(params, reply) {
  console.log("-> parse: ", params);
  let project = Parser.parseProject(params["code"]);
  // console.log(`  result: ${project}`);
  console.log("<- parse response: ", project);
  reply(null, project);
}

// RPC CALL: update
// update code from adt
export function update(params, reply) {
  console.log("-> update: ", params);
  let { models, requests } = params["project"];
  // let code_project = extractProject(params["code"]);

  var code: string[] = [];

  for (let model of models) {
    code.push(Generator.createModel(model));
  }

  for (let request of requests) {
    code.push(Generator.createRequest(request));
  }

  reply(null, {
    code: code.join("\n\n")
  });
}
