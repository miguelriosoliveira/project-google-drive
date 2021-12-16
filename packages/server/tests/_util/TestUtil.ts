import { Readable, Transform, Writable } from 'stream';

export class TestUtil {
	static mockDateNow(dates: number[]) {
		dates.forEach(date => jest.spyOn(Date, 'now').mockReturnValueOnce(date));
	}

	static generateReadableStream(chunks: unknown[]) {
		return new Readable({
			objectMode: true,
			read() {
				chunks.forEach(chunk => this.push(chunk));
				this.push(null);
			},
		});
	}

	static generateTransformStream(handleTransformData: (chunk: unknown) => void) {
		return new Transform({
			objectMode: true,
			transform(chunk, encoding, next) {
				handleTransformData(chunk);
				next(null, chunk);
			},
		});
	}

	static generateWritableStream(handleWriteData: (chunk: unknown) => void) {
		return new Writable({
			objectMode: true,
			write(chunk, encoding, next) {
				handleWriteData(chunk);
				next();
			},
		});
	}
}
