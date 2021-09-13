import fs from 'fs';
import { Readable, Transform, Writable } from 'stream';
// eslint-disable-next-line import/no-unresolved
import { pipeline } from 'stream/promises';

import Busboy from 'busboy';
import { Server } from 'socket.io';

import { logger } from './logger';

interface UploadHandlerProps {
	io: Server;
	socketId: string;
	downloadsDir: string;
}

interface OnFileProps {
	fieldName: string;
	fileStream: Readable;
	fileName: string;
}

interface RegisterEventsProps {
	headers: Record<string, unknown>;
	onFinish: () => void;
}

export class UploadHandler {
	io: Server;

	socketId: string;

	downloadsDir: string;

	constructor({ io, socketId, downloadsDir }: UploadHandlerProps) {
		this.io = io;
		this.socketId = socketId;
		this.downloadsDir = downloadsDir;
	}

	handleFileBytes(fileName: string) {
		// return fs.createWriteStream(fileName);
	}

	async onFile({ fieldName, fileStream, fileName }: OnFileProps) {
		const saveTo = `${this.downloadsDir}/${fileName}`;
		await pipeline(
			fileStream,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.handleFileBytes.apply(this, [fileName]),
			fs.createWriteStream(saveTo),
		);
		logger.info(`File [${fileName}] finished!`);
	}

	registerEvents({ headers, onFinish }: RegisterEventsProps) {
		const busboy = new Busboy({ headers });
		busboy.on('file', this.onFile.bind(this));
		busboy.on('finish', onFinish);
		return busboy;
	}
}
