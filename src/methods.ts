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
  console.log("parse -> params: ", params);
  reply(null, Parser.parseProject(params["code"]));
}

// RPC CALL: update
// update code from adt
export function update(params, reply) {
  console.log("update -> params: ", params);
  let { models, requests } = params["project"];
  // let code_project = extractProject(params["code"]);

  let model_code = models
    .map((model: string) => {
      return Generator.createModel(model);
    })
    .join("\n\n");

  reply(null, { code: model_code });
}
