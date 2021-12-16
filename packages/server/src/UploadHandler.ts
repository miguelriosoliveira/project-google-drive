import fs from 'fs';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';

import Busboy from 'busboy';
import { Server } from 'socket.io';

import { EVENTS } from './events';
import { logger } from './logger';

interface UploadHandlerProps {
	io: Server;
	socketId: string;
	downloadsDir: string;
	messageDelay?: number;
}

interface RegisterEventsProps {
	headers: Record<string, unknown>;
	onFinish: () => void;
}

export class UploadHandler {
	io: Server;

	socketId: string;

	downloadsDir: string;

	messageDelay: number;

	constructor({ io, socketId, downloadsDir, messageDelay = 200 }: UploadHandlerProps) {
		this.io = io;
		this.socketId = socketId;
		this.downloadsDir = downloadsDir;
		this.messageDelay = messageDelay;
	}

	canNotify(lastNotificationTime: number) {
		return Date.now() - lastNotificationTime >= this.messageDelay;
	}

	handleFileBytes(fileName: string) {
		let processedBytes = 0;
		let lastNotificationTime = Date.now();

		const handleTransform = (chunk: unknown) => {
			processedBytes += String(chunk).length;
			if (this.canNotify(lastNotificationTime)) {
				lastNotificationTime = Date.now();
				this.io.to(this.socketId).emit(EVENTS.UPLOAD_EVENT, { processedBytes, fileName });
				logger.info(`File ${fileName} got ${processedBytes} bytes processed to ${this.socketId}`);
			}
		};

		const transformStream = new Transform({
			objectMode: true,
			transform(chunk, encoding, next) {
				handleTransform(chunk);
				next(null, chunk);
			},
		});

		return transformStream;
	}

	async onFile(fieldName: string, fileStream: Readable, fileName: string) {
		const saveTo = `${this.downloadsDir}/${fileName}`;
		await pipeline(
			fileStream,
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
