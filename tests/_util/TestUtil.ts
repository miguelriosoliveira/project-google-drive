import { Readable, Transform, Writable } from 'stream';

export class TestUtil {
	static generateReadableStream(chunks: unknown[]) {
		return new Readable({
			objectMode: true,
			read() {
				chunks.forEach(chunk => this.push(chunk));
				this.push(null);
			},
		});
	}

	static generateTransformStream(onTransform: (chunk: unknown) => void) {
		return new Transform({
			objectMode: true,
			transform(chunk, encoding, next) {
				onTransform(chunk);
				next(null, chunk);
			},
		});
	}

	static generateWritableStream(onData: (chunk: unknown) => void) {
		return new Writable({
			objectMode: true,
			write(chunk, encoding, next) {
				onData(chunk);
				next();
			},
		});
	}
}
