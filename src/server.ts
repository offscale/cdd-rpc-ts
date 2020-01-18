import * as Methods from "./methods";

var JsonRpcWs = require("json-rpc-ws");
var server = JsonRpcWs.createServer();

server.expose("generate", Methods.generate);
server.expose("parse", Methods.parse);

// start server
server.start({ port: 7778 }, function started() {
  console.log("Server started on port 7778");
});
