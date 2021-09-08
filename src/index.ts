import 'dotenv/config';

import fs from 'fs';
import https from 'https';
import { AddressInfo } from 'net';

import { logger } from './logger';

const PORT = process.env.PORT || 3000;

const sslConfig = {
	key: fs.readFileSync('./certificates/key.pem'),
	cert: fs.readFileSync('./certificates/cert.pem'),
};

const server = https.createServer(sslConfig, (req, res) => res.end('hellouuu'));

server.listen(PORT, () => {
	const { address, port } = server.address() as AddressInfo;
	logger.info(`🚀 Server running on https://${address}:${port}`);
});
