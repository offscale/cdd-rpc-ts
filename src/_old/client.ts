var JsonRpcWs = require('json-rpc-ws');
var client = JsonRpcWs.createClient();

client.connect('ws://localhost:8080', function connected () {
    client.send('list-models', { limit: 0 }, function mirrorReply (error, reply) {
        console.log('reply -> ', reply);
    });
});
