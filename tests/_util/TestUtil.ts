import { Readable } from 'stream';

export class TestUtil {
	static generateReadableStream(data: unknown[]) {
		const readableStream = new Readable({
			objectMode: true,
			async read() {
				data.forEach(chunk => this.push(chunk));
				this.push(null);
			},
		});
		return readableStream;
	}
}
