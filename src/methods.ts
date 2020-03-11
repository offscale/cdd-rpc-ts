import { Generator } from "./generator";
import * as Parser from "./parser";

// RPC CALL: serialise
// generate code from adt
export function serialise(params, reply) {
  console.log("-> serialise: ", params);

  let ast = Parser.stringToSource(params.code);

  console.log("<- serialise: ", { ast: ast });
  reply(null, { ast: ast });
}

// RPC CALL: deserialise
// generate code from adt
export function deserialise(params, reply) {
  console.log("-> deserialise: ", params);

  let code = Parser.stringToSource(params.code);

  console.log("-> deserialise: ", { code: code });
  reply(null, { code: code });
}

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
  reply(null, { prooject: project });
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
