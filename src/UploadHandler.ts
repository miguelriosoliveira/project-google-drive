import Busboy from 'busboy';
import { Server } from 'socket.io';

interface UploadHandlerProps {
	io: Server;
	socketId: string;
}

interface OnFileProps {
	fieldName: string;
	file: File;
	fileName: string;
}

interface RegisterEventsProps {
	headers: Record<string, unknown>;
	onFinish: () => void;
}

export class UploadHandler {
	constructor({ io, socketId }: UploadHandlerProps) {}

	onFile({ fieldName, file, fileName }: OnFileProps) {
		return 'batata';
	}

	registerEvents({ headers, onFinish }: RegisterEventsProps) {
		const busboy = new Busboy({ headers });
		busboy.on('file', this.onFile.bind(this));
		busboy.on('finish', onFinish);
		return busboy;
	}
}
