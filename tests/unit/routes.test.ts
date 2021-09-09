import http, { IncomingMessage, ServerResponse } from 'http';

import io from 'socket.io';

import { Routes } from '../../src/Routes';

let routes: Routes;

beforeEach(() => {
	routes = new Routes();
});

describe('#Routes', () => {
	type Request = Partial<IncomingMessage>;
	type Response = Partial<ServerResponse>;
	let request: Request;
	let response: Response;
	const defaultParams: [Request, Response] = [
		{
			method: '',
			headers: { 'Content-Type': 'multipart/form-data' },
		},
		{
			setHeader: jest.fn(),
			writeHead: jest.fn(),
			end: jest.fn(),
		},
	];

	beforeEach(() => {
		[request, response] = [...defaultParams];
	});

	describe('#setSocketInstance', () => {
		test('it should store io server instance', () => {
			const httpServer = http.createServer();
			const ioServer = new io.Server(httpServer);
			routes.setSocketInstance(ioServer);
			expect(routes.ioServer).toStrictEqual(ioServer);
		});
	});

	describe('#handler', () => {
		test('it should enable CORS on all requests', async () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await routes.handler(request, response);
			expect(response.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
		});

		test('given an inexistent method, it should choose the default one', async () => {
			request.method = 'potato';
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await routes.handler(request, response);
			expect(response.end).toHaveBeenCalledWith('invalid method');
		});

		test('given the method OPTIONS, it should choose the options route', async () => {
			request.method = 'OPTIONS';
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await routes.handler(request, response);
			expect(response.writeHead).toHaveBeenCalledWith(204);
			expect(response.end).toHaveBeenCalledWith();
		});

		test('given the method POST, it should choose the post route', async () => {
			request.method = 'POST';
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			jest.spyOn(routes, routes.post.name).mockResolvedValue();
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await routes.handler(request, response);
			expect(routes.post).toHaveBeenCalledWith(request, response);
		});

		test('given the method GET, it should choose the get route', async () => {
			request.method = 'GET';
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			jest.spyOn(routes, routes.get.name).mockResolvedValue();
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await routes.handler(request, response);
			expect(routes.get).toHaveBeenCalled();
		});
	});

	describe('#get', () => {
		test('it should list all filed available', async () => {
			const fileStatusesMocks = [
				{
					name: 'file.png',
					owner: 'system_user',
					last_modified: '2021-09-03T20:56:28.443Z',
					size: '188 kB',
				},
			];
			request.method = 'GET';
			jest
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.spyOn(routes.fileHelper, routes.fileHelper.getFileStatuses.name)
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.mockResolvedValue(fileStatusesMocks);
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			await routes.handler(request, response);
			expect(response.writeHead).toHaveBeenCalledWith(200);
			expect(response.end).toHaveBeenCalledWith(JSON.stringify(fileStatusesMocks));
		});
	});
});
