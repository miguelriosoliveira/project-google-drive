import fs from 'fs';
import { pipeline } from 'stream/promises';

import io from 'socket.io';

import { EVENTS } from '../../src/events';
import { logger } from '../../src/logger';
import { UploadHandler } from '../../src/UploadHandler';
import { TestUtil } from '../_util/TestUtil';

let uploadHandler: UploadHandler;
let ioServer: io.Server;

beforeEach(() => {
	ioServer = new io.Server();
	uploadHandler = new UploadHandler({
		io: ioServer,
		socketId: '123',
		downloadsDir: '/tmp',
	});
	jest.spyOn(logger, 'info').mockImplementation();
});

describe('UploadHandler', () => {
	describe('.registerEvents', () => {
		test('it should call onFile and onFinish functions on Busboy instance', () => {
			jest.spyOn(uploadHandler, 'onFile').mockResolvedValue();
			const onFinishMock = jest.fn();
			const busboyInstance = uploadHandler.registerEvents({
				headers: { 'content-type': 'multipart/form-data; boundary=' },
				onFinish: onFinishMock,
			});

			const readableStream = TestUtil.generateReadableStream(['chunks', 'of', 'data']);
			busboyInstance.emit('file', 'fieldName', readableStream, 'file.txt');
			busboyInstance.listeners('finish')[0].call(this);

			expect(uploadHandler.onFile).toHaveBeenCalled();
			expect(onFinishMock).toHaveBeenCalled();
		});
	});

	describe('.onFile', () => {
		test('given a stream chunk, it should save it on disk', async () => {
			const onTransformMock = jest.fn();
			jest
				.spyOn(uploadHandler, 'handleFileBytes')
				.mockImplementation(() => TestUtil.generateTransformStream(onTransformMock));

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

			expect(onTransformMock.mock.calls.join()).toStrictEqual(chunks.join());
			expect(onDataMock.mock.calls.join()).toStrictEqual(chunks.join());
			expect(uploadHandler.handleFileBytes).toHaveBeenCalledWith('video.mov');
			expect(fs.createWriteStream).toHaveBeenCalledWith(`${uploadHandler.downloadsDir}/video.mov`);
		});
	});

	describe('.handleFileBytes', () => {
		test('it should call emit function and it is a transform stream', async () => {
			jest.spyOn(ioServer, 'to').mockReturnThis();
			jest.spyOn(ioServer, 'emit');
			jest.spyOn(uploadHandler, 'canNotify').mockReturnValue(true);

			const chunks = ['hey', 'dude'];
			const handleWriteMock = jest.fn();
			const readableStreamMock = TestUtil.generateReadableStream(chunks);
			const writableStreamMock = TestUtil.generateWritableStream(handleWriteMock);

			await pipeline(
				readableStreamMock,
				uploadHandler.handleFileBytes('file.txt'),
				writableStreamMock,
			);

			expect(ioServer.to).toHaveBeenCalledTimes(chunks.length);
			expect(ioServer.emit).toHaveBeenCalledTimes(chunks.length);
			expect(handleWriteMock).toHaveBeenCalledTimes(chunks.length);
			expect(handleWriteMock.mock.calls.join()).toStrictEqual(chunks.join());
		});

		test('given a 2sec message delay and that each chunk takes 1sec to be processed, it should only emit 3 out of 5 messages', async () => {
			jest.spyOn(ioServer, 'to').mockReturnThis();
			const emitSpy = jest.spyOn(ioServer, 'emit');

			uploadHandler = new UploadHandler({
				io: ioServer,
				socketId: '123',
				downloadsDir: '/tmp',
				messageDelay: 2 * 1000, // 2 seconds
			});

			const initialTime = new Date('2014-01-25 00:00:00').getTime();
			const notificationTime1 = new Date('2014-01-25 00:00:02').getTime();
			const notificationUpdateTime1 = notificationTime1;
			const notificationTime2 = new Date('2014-01-25 00:00:03').getTime();
			const notificationTime3 = new Date('2014-01-25 00:00:04').getTime();
			const notificationUpdateTime2 = notificationTime3;
			const notificationTime4 = new Date('2014-01-25 00:00:05').getTime();
			const notificationTime5 = new Date('2014-01-25 00:00:06').getTime();
			const notificationUpdateTime3 = notificationTime5;

			TestUtil.mockDateNow([
				initialTime,
				notificationTime1,
				notificationUpdateTime1,
				notificationTime2,
				notificationTime3,
				notificationUpdateTime2,
				notificationTime4,
				notificationTime5,
				notificationUpdateTime3,
			]);

			const chunks = ['hey', 'dude', 'look', 'at', 'me'];
			const handleWriteMock = jest.fn();
			const readableStreamMock = TestUtil.generateReadableStream(chunks);
			const writableStreamMock = TestUtil.generateWritableStream(handleWriteMock);
			const fileName = 'file.txt';

			await pipeline(
				readableStreamMock,
				uploadHandler.handleFileBytes('file.txt'),
				writableStreamMock,
			);

			expect(emitSpy).toHaveBeenCalledTimes(3);
			expect(emitSpy.mock.calls).toEqual([
				[EVENTS.UPLOAD_EVENT, { processedBytes: 'hey'.length, fileName }],
				[EVENTS.UPLOAD_EVENT, { processedBytes: 'heydudelook'.length, fileName }],
				[EVENTS.UPLOAD_EVENT, { processedBytes: 'heydudelookatme'.length, fileName }],
			]);
		});
	});

	describe('.canNotify', () => {
		test('it should return true when last execution time was longer or equal specified delay', () => {
			uploadHandler = new UploadHandler({
				io: ioServer,
				socketId: '123',
				downloadsDir: '/tmp',
				messageDelay: 2 * 1000, // 2 seconds
			});

			const now = new Date();
			const threeSecondsAgo = new Date().setSeconds(now.getSeconds() - 3);

			const canNotify = uploadHandler.canNotify(threeSecondsAgo);
			expect(canNotify).toBeTruthy();
		});

		test('it should return false when last execution time was shorter than specified delay', () => {
			uploadHandler = new UploadHandler({
				io: ioServer,
				socketId: '123',
				downloadsDir: '/tmp',
				messageDelay: 2 * 1000, // 2 seconds
			});

			const now = new Date();
			const oneSecondAgo = new Date().setSeconds(now.getSeconds() - 1);

			const canNotify = uploadHandler.canNotify(oneSecondAgo);
			expect(canNotify).toBeFalsy();
		});
	});
});
