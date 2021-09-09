import pino from 'pino';

export const logger = pino({
	prettyPrint: {
		ignore: 'pid,hostname',
		translateTime: 'yyyy-mm-dd HH:MM:ss.l',
	},
});
