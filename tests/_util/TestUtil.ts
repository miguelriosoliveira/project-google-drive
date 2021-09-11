import { Readable, Transform, Writable } from 'stream';

export class TestUtil {
	static generateReadableStream(data: unknown[]) {
		return new Readable({
			objectMode: true,
			read() {
				console.log('>>>>>>>>>');
				data.forEach(chunk => this.push(chunk));
				this.push(null);
			},
		});
	}

	static generateWritableStream(onData: (chunk: unknown) => void) {
		return new Writable({
			objectMode: true,
			write(chunk, encondig, callback) {
				console.log('===============================');
				onData(chunk);
				callback();
			},
		});
	}

	static generateTransformStream(onTransform: (chunk: unknown) => void) {
		return new Transform({
			objectMode: true,
			transform(chunk, encoding, callback) {
				console.log('---------------------------------', chunk);
				onTransform(chunk);
				callback(null);
			},
		});
	}
}
