import { IncomingMessage, ServerResponse, RequestListener } from 'http';

import { Server } from 'socket.io';

import { logger } from './logger';

export class Routes {
	ioServer: Server | undefined;

	constructor() {}

	async defaultMethod(request: IncomingMessage, response: ServerResponse) {
		logger.info('this is DEFAULT');
		response.end('this is DEFAULT');
	}

	async options(request: IncomingMessage, response: ServerResponse) {
		logger.info('this is OPTIONS');
		response.writeHead(204);
		response.end();
	}

	async post(request: IncomingMessage, response: ServerResponse) {
		logger.info('this is POST');
		response.end();
	}

	async get(request: IncomingMessage, response: ServerResponse) {
		logger.info('this is GET');
		response.end();
	}

	setSocketInstance(io: Server) {
		this.ioServer = io;
	}

	handler(request: IncomingMessage, response: ServerResponse) {
		response.setHeader('Access-Control-Allow-Origin', '*');

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const chosenMethod: RequestListener = this[request.method.toLowerCase()] || this.defaultMethod;

		return chosenMethod.apply(this, [request, response]);
	}
}
