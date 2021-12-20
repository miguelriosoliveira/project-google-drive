import fs from 'fs';

import { FileHelper } from '../../src/FileHelper';

describe('#FileHelper', () => {
	describe('#getFileStatus', () => {
		test('it should return list of file statuses in correct format', async () => {
			const statMock: Partial<fs.Stats> = {
				dev: 16_777_220,
				mode: 33_188,
				nlink: 1,
				uid: 501,
				gid: 20,
				rdev: 0,
				blksize: 4096,
				ino: 214_187_433,
				size: 188_188,
				blocks: 368,
				atimeMs: 1_630_702_590_337.3582,
				mtimeMs: 1_630_702_588_444.2876,
				ctimeMs: 1_630_702_588_452.0754,
				birthtimeMs: 1_630_702_588_443.3276,
				atime: new Date('2021-09-03T20:56:30.337Z'),
				mtime: new Date('2021-09-03T20:56:28.444Z'),
				ctime: new Date('2021-09-03T20:56:28.452Z'),
				birthtime: new Date('2021-09-03T20:56:28.443Z'),
			};

			jest.spyOn(fs.promises, 'readdir').mockResolvedValue(['file.png'] as unknown as fs.Dirent[]);
			jest.spyOn(fs.promises, 'stat').mockResolvedValue(statMock as fs.Stats);
			process.env.USER = 'system_user';
			const fileStatuses = await FileHelper.getFileStatuses('/tmp');
			const expectedFileStatuses = [
				{
					name: 'file.png',
					owner: 'system_user',
					last_modified: '2021-09-03T20:56:28.443Z',
					size: '188 kB',
				},
			];
			expect(fs.promises.stat).toHaveBeenCalledWith('/tmp/file.png');
			expect(fileStatuses).toMatchObject(expectedFileStatuses);
		});
	});
});
