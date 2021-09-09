import http, { IncomingMessage, ServerResponse } from 'http';

import io from 'socket.io';

import { Routes } from '../../src/routes';

describe('#Routes', () => {
	describe('#setSocketInstance', () => {
		test('it should store io server instance', () => {
			// Arrange
			const routes = new Routes();
			const httpServer = http.createServer();
			const ioServer = new io.Server(httpServer);

			// Act
			routes.setSocketInstance(ioServer);

			// Assert
			expect(routes.ioServer).toStrictEqual(ioServer);
		});
	});

	describe('#handler', () => {
		type IDefaultParams = [Partial<IncomingMessage>, Partial<ServerResponse>];

		const defaultParams: IDefaultParams = [
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

		test('given an inexistent route, it should choose the default one', () => {
			const routes = new Routes();
			const [request, response] = [...defaultParams];
			request.method = 'potato';

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			routes.handler(request, response);

			expect(response.end).toHaveBeenCalledWith('this is DEFAULT');
		});
		test.todo('it should enable CORS on all requests');
		test.todo('given the method OPTIONS, it should choose the options route');
		test.todo('given the method POST, it should choose the post route');
		test.todo('given the method GET, it should choose the get route');
	});
});
