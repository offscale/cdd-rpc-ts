var JsonRpcWs = require("json-rpc-ws");
// var generator = import("./generator");
import { Generator } from "./generator";
var server = JsonRpcWs.createServer();

server.expose("generateCode", function mirror(params, reply) {
  console.log("generateCode -> params: ", params);

  let code = Generator.createModel("Doggo");
  reply(null, { code: code });
});

server.expose("parse", function mirror(params, reply) {
  console.log("parse -> params: ", params);
  // let model = Generator.createModel("Doggo");
  reply(null, { models: Generator.parseModels(params["code"]) });
});

// server.expose("list-models", function mirror(params, reply) {
//   console.log("list-models called. params: ", params);
//   reply(null, [{ name: "Pet", code: "function pet() {}" }]);
// });

server.start({ port: 7778 }, function started() {
  console.log("Server started on port 7778");
});
