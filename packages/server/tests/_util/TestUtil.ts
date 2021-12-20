import { Readable, Transform, Writable } from 'stream';

export const TestUtil = {
	mockDateNow(dates: number[]) {
		dates.forEach(date => jest.spyOn(Date, 'now').mockReturnValueOnce(date));
	},

	generateReadableStream(chunks: unknown[]) {
		return new Readable({
			objectMode: true,
			read() {
				chunks.forEach(chunk => this.push(chunk));
				this.push(null);
			},
		});
	},

	generateTransformStream(handleTransformData: (chunk: unknown) => void) {
		return new Transform({
			objectMode: true,
			transform(chunk, encoding, next) {
				handleTransformData(chunk);
				next(null, chunk);
			},
		});
	},

	generateWritableStream(handleWriteData: (chunk: unknown) => void) {
		return new Writable({
			objectMode: true,
			write(chunk, encoding, next) {
				handleWriteData(chunk);
				next();
			},
		});
	},
};
