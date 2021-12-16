import fs from 'fs';

import { FileHelper } from '../../src/FileHelper';

describe('#FileHelper', () => {
	describe('#getFileStatus', () => {
		test('it should return list of file statuses in correct format', async () => {
			const statMock: Partial<fs.Stats> = {
				dev: 16777220,
				mode: 33188,
				nlink: 1,
				uid: 501,
				gid: 20,
				rdev: 0,
				blksize: 4096,
				ino: 214187433,
				size: 188188,
				blocks: 368,
				atimeMs: 1630702590337.3582,
				mtimeMs: 1630702588444.2876,
				ctimeMs: 1630702588452.0754,
				birthtimeMs: 1630702588443.3276,
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
