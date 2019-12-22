var JsonRpcWs = require('json-rpc-ws');
var server = JsonRpcWs.createServer();

server.expose('list-models', function mirror (params, reply) {
    console.log('list-models called. params: ', params);
    reply(null, []);
});

server.start({ port: 8080 }, function started () {
    console.log('Server started on port 8080');
});
