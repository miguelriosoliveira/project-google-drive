import http, { IncomingMessage, ServerResponse } from 'http';

import io from 'socket.io';

import { Routes } from '../../src/routes';

let routes: Routes;

beforeEach(() => {
	routes = new Routes();
});

describe('#Routes', () => {
	describe('#setSocketInstance', () => {
		test('it should store io server instance', () => {
			const httpServer = http.createServer();
			const ioServer = new io.Server(httpServer);
			routes.setSocketInstance(ioServer);
			expect(routes.ioServer).toStrictEqual(ioServer);
		});
	});

	describe('#handler', () => {
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

		test('it should enable CORS on all requests', () => {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			routes.handler(request, response);
			expect(response.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
		});

		test('given an inexistent route, it should choose the default one', () => {
			request.method = 'potato';
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			routes.handler(request, response);
			expect(response.end).toHaveBeenCalledWith('this is DEFAULT');
		});

		test.todo('given the method OPTIONS, it should choose the options route');

		test.todo('given the method POST, it should choose the post route');

		test.todo('given the method GET, it should choose the get route');
	});
});
