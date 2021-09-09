import 'dotenv/config';

import fs from 'fs';
import https from 'https';
import { AddressInfo } from 'net';

import { Server } from 'socket.io';

import { logger } from './logger';
import { Routes } from './Routes';

const PORT = process.env.PORT || 3000;

const routes = new Routes();

const server = https.createServer(
	{
		key: fs.readFileSync('./certificates/key.pem'),
		cert: fs.readFileSync('./certificates/cert.pem'),
	},
	routes.handler.bind(routes),
);

const ioServer = new Server(server, {
	cors: {
		origin: '*',
		credentials: false,
	},
});

ioServer.on('connection', socket => logger.info('Someone connected:', socket.id));

server.listen(PORT, () => {
	const { address, port } = server.address() as AddressInfo;
	logger.info(`🚀 Server running on https://${address}:${port}`);
});
