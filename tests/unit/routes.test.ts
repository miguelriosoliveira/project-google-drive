import http from 'http';

import io from 'socket.io';

import { Routes } from '../../src/routes';

describe('#Routes', () => {
	describe('#setSocketInstance', () => {
		test('it should store io instance', () => {
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
});
