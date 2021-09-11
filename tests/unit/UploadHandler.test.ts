import fs from 'fs';

import io from 'socket.io';

import { logger } from '../../src/logger';
import { UploadHandler } from '../../src/UploadHandler';
import { TestUtil } from '../_util/TestUtil';

let uploadHandler: UploadHandler;

beforeEach(() => {
	const ioServer = new io.Server();
	uploadHandler = new UploadHandler({
		io: ioServer,
		socketId: '123',
		downloadsDir: '/tmp',
	});
	jest.spyOn(logger, 'info').mockImplementation();
});

describe('#UploadHandler', () => {
	// describe('#registerEvents', () => {
	// 	test('it should call onFile and onFinish functions on Busboy instance', () => {
	// 		jest.spyOn(uploadHandler, 'onFile').mockResolvedValue();
	// 		const headers = { 'content-type': 'multipart/form-data; boundary=' };
	// 		const onFinishMock = jest.fn();
	// 		const busboyInstance = uploadHandler.registerEvents({ headers, onFinish: onFinishMock });
	// 		const readableStream = TestUtil.generateReadableStream(['chunks', 'of', 'data']);
	// 		busboyInstance.emit('file', 'fieldName', readableStream, 'file.txt');
	// 		busboyInstance.listeners('finish')[0].call(this);
	// 		expect(uploadHandler.onFile).toHaveBeenCalled();
	// 		expect(onFinishMock).toHaveBeenCalled();
	// 	});
	// });

	describe('#onFile', () => {
		test('given a stream chunk, it should save it on disk', async () => {
			const onTransformMock = jest.fn();
			jest
				.spyOn(uploadHandler, 'handleFileBytes')
				.mockImplementation(
					() => TestUtil.generateTransformStream(onTransformMock) as unknown as fs.WriteStream,
				);

			const onDataMock = jest.fn();
			jest
				.spyOn(fs, 'createWriteStream')
				.mockImplementation(() => TestUtil.generateWritableStream(onDataMock) as fs.WriteStream);

			const chunks = ['hey', 'dude'];
			await uploadHandler.onFile({
				fieldName: 'video',
				fileStream: TestUtil.generateReadableStream(chunks),
				fileName: 'video.mov',
			});

			// expect(onTransformMock.mock.calls.join()).toStrictEqual(chunks.join());
			// expect(uploadHandler.handleFileBytes).toHaveBeenCalled();
			// expect(fs.createWriteStream).toHaveBeenCalledWith(`${uploadHandler.downloadsDir}/video.mov`);
			expect(onDataMock.mock.calls.join()).toStrictEqual(chunks.join());
		});
	});
});
