import io from 'socket.io';

import { UploadHandler } from '../../src/UploadHandler';
import { TestUtil } from '../_util/TestUtil';

describe('#UploadHandler', () => {
	describe('#registerEvents', () => {
		test('it should call onFile and onFinish functions on Busboy instance', () => {
			const ioServer = new io.Server();
			const uploadHandler = new UploadHandler({
				io: ioServer,
				socketId: '123',
			});
			jest.spyOn(uploadHandler, 'onFile').mockReturnValue('potato');
			const headers = { 'content-type': 'multipart/form-data; boundary=' };
			const onFinishMock = jest.fn();
			const busboyInstance = uploadHandler.registerEvents({ headers, onFinish: onFinishMock });
			const readableStream = TestUtil.generateReadableStream(['chunks', 'of', 'data']);
			busboyInstance.emit('file', 'fieldName', readableStream, 'file.txt');
			busboyInstance.listeners('finish')[0].call(this);
			expect(uploadHandler.onFile).toHaveBeenCalled();
			expect(onFinishMock).toHaveBeenCalled();
		});
	});
});
