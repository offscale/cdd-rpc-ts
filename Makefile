build:
	rm build/*
	tsc src/server.ts --outDir build

server:
	tsc src/server.ts --esModuleInterop --outDir build
	node build/server.js

client:
	tsc client-rpc.ts && node client-rpc.js

clean:
	rm src/*.js
	rm build/*.js
