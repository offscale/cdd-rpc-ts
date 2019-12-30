var JsonRpcWs = require('json-rpc-ws');
var reader = import('./reader');
var server = JsonRpcWs.createServer();

server.expose('list-models', function mirror (params, reply) {
    console.log('list-models called. params: ', params);
    reply(null, [{"name": "Pet"}]);
});

server.start({ port: 8080 }, function started () {
    console.log('Server started on port 8080');
});
