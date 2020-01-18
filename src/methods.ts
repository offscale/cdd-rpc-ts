import { Generator } from "./generator";

export function generate(params, reply) {
  console.log("generate -> params: ", params);

  let models = params["models"]
    .map((model: string) => {
      return Generator.createModel(model);
    })
    .join("\n\n");

  reply(null, { code: models });
}

export function parse(params, reply) {
  console.log("parse -> params: ", params);
  reply(null, Generator.parseProject(params["code"]));
}
