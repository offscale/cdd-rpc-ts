build:
	tsc server-rpc.ts

server: build
	node server-rpc.js

client:
	tsc client-rpc.ts && node client-rpc.js
