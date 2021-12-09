import fs from 'fs';
import http, { IncomingMessage, ServerResponse } from 'http';
import { tmpdir } from 'os';
import path from 'path';

import FormData from 'form-data';
import io from 'socket.io';

import { logger } from '../../src/logger';
import { Routes } from '../../src/Routes';
import { TestUtil } from '../_util/TestUtil';

describe('Routes', () => {
	let defaultDownloadsDir = '';

	beforeAll(async () => {
		defaultDownloadsDir = await fs.promises.mkdtemp(path.join(tmpdir(), 'downloads-'));
	});

	afterAll(async () => {
		// console.log(defaultDownloadsDir);
		await fs.promises.rm(defaultDownloadsDir, { recursive: true });
	});

	beforeEach(() => {
		jest.spyOn(logger, 'info').mockImplementation(() => {});
	});

	describe('.handler', () => {
		test('it should upload file to the folder', async () => {
			const filename = 'lorem-ipsum.txt';
			const fileStream = fs.createReadStream(path.join(__dirname, './mocks/lorem-ipsum.txt'));
			const responseStream = TestUtil.generateWritableStream(() => {});

			const formData = new FormData();
			formData.append('text-file', fileStream);

			const request = Object.assign(formData, {
				headers: formData.getHeaders(),
				method: 'POST',
				url: '?socketId=10',
			}) as unknown as IncomingMessage;

			const response = Object.assign(responseStream, {
				setHeader: jest.fn(),
				writeHead: jest.fn(),
				end: jest.fn(),
			}) as unknown as ServerResponse;

			const routes = new Routes(defaultDownloadsDir);
			const httpServer = http.createServer();
			const ioServer = new io.Server(httpServer);
			routes.setSocketInstance(ioServer);

			const dirFiles = await fs.promises.readdir(defaultDownloadsDir);
			expect(dirFiles).toEqual([]);

			await routes.handler(request, response);

			const dirFilesAfter = await fs.promises.readdir(defaultDownloadsDir);
			expect(dirFilesAfter).toEqual([filename]);

			expect(response.writeHead).toHaveBeenCalledWith(200);
			expect(response.end).toHaveBeenCalledWith(
				JSON.stringify({ result: 'Files uploaded successfully' }),
			);
		});
	});
});
