import * as Methods from "./methods";

import * as JsonRpcWs from "json-rpc-ws";
const server = JsonRpcWs.createServer();

server.expose("generate", Methods.generate);
server.expose("parse", Methods.parse);
server.expose("update", Methods.update);

// start server
const port = process.env.PORT == null ? 7778 : parseInt(process.env.PORT);
const host = process.env.HOST == null ? 'localhost' : process.env.HOST;
server.start({ host, port }, function started() {
  console.log(`TypeScript JSON-RPC socket server listening on ${host}:${port}…`);
});
