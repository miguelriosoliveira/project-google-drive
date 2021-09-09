import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import path from 'path';

import { Server } from 'socket.io';

import { FileHelper } from './FileHelper';

const defaultDownloadsDir = path.resolve(__dirname, '../', 'downloads');
export class Routes {
	ioServer: Server | undefined;

	downloadsDir: string;

	fileHelper: typeof FileHelper;

	constructor(downloadsDir = defaultDownloadsDir) {
		this.downloadsDir = downloadsDir;
		this.fileHelper = FileHelper;
	}

	async defaultMethod(request: IncomingMessage, response: ServerResponse) {
		response.end('invalid method');
	}

	async options(request: IncomingMessage, response: ServerResponse) {
		response.writeHead(204);
		response.end();
	}

	async post(request: IncomingMessage, response: ServerResponse) {
		response.end();
	}

	async get(request: IncomingMessage, response: ServerResponse) {
		const fileStatuses = await this.fileHelper.getFileStatuses(this.downloadsDir);
		response.writeHead(200);
		response.end(JSON.stringify(fileStatuses));
	}

	setSocketInstance(io: Server) {
		this.ioServer = io;
	}

	async handler(request: IncomingMessage, response: ServerResponse) {
		response.setHeader('Access-Control-Allow-Origin', '*');

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const chosenMethod: RequestListener = this[request.method.toLowerCase()] || this.defaultMethod;

		return chosenMethod.apply(this, [request, response]);
	}
}
