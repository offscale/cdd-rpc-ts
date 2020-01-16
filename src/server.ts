var JsonRpcWs = require("json-rpc-ws");
// var reader = import('./reader');
var server = JsonRpcWs.createServer();

server.expose("generateCode", function mirror(params, reply) {
  console.log("generateCode -> params: ", params);
  reply(null, { code: "function pet() {}" });
});

server.expose("parse", function mirror(params, reply) {
  console.log("parse -> params: ", params);
  reply(null, { models: ["Doggo"] });
});

// server.expose("list-models", function mirror(params, reply) {
//   console.log("list-models called. params: ", params);
//   reply(null, [{ name: "Pet", code: "function pet() {}" }]);
// });

server.start({ port: 7778 }, function started() {
  console.log("Server started on port 7778");
});
