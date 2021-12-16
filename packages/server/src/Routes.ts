import { IncomingMessage, RequestListener, ServerResponse } from 'http';
import path from 'path';
import { pipeline } from 'stream/promises';
import { parse } from 'url';

import { Server } from 'socket.io';

import { FileHelper } from './FileHelper';
import { logger } from './logger';
import { UploadHandler } from './UploadHandler';

const DEFAULT_DOWNLOADS_DIR = path.resolve(__dirname, '../', 'downloads');

export class Routes {
	ioServer?: Server;

	downloadsDir: string;

	fileHelper: typeof FileHelper;

	constructor(downloadsDir = DEFAULT_DOWNLOADS_DIR) {
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
		const { headers, url } = request;

		if (!url) {
			throw new Error('Missing URL');
		}

		const { query } = parse(url, true);
		const { socketId } = query as { socketId: string };

		if (!this.ioServer) {
			throw new Error('Socket instance not set');
		}

		if (!socketId) {
			throw new Error('Missing Socket ID');
		}

		const uploadHandler = new UploadHandler({
			io: this.ioServer,
			socketId,
			downloadsDir: this.downloadsDir,
		});

		const busboyInstance = uploadHandler.registerEvents({
			headers,
			onFinish: () => {
				response.writeHead(200);
				const data = JSON.stringify({ result: 'Files uploaded successfully' });
				response.end(data);
			},
		});

		await pipeline(request, busboyInstance);

		logger.info('Request finished successfully');
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
