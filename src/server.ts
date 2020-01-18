var JsonRpcWs = require("json-rpc-ws");
import { Generator } from "./generator";
var server = JsonRpcWs.createServer();

server.expose("generateCode", function mirror(params, reply) {
  console.log("generateCode -> params: ", params);

  let models = params["models"]
    .map((model: string) => {
      return Generator.createModel(model);
    })
    .join("\n\n");

  reply(null, { code: models });
});

server.expose("parse", function mirror(params, reply) {
  console.log("parse -> params: ", params);
  // reply(null, { models: Generator.parseModels(params["code"]) });
  reply(null, Generator.parseProject(params["code"]));
});

server.start({ port: 7778 }, function started() {
  console.log("Server started on port 7778");
});
