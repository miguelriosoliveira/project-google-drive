import fs from 'fs';

import prettyBytes from 'pretty-bytes';

interface FileStatus {
	name: string;
	owner: string;
	last_modified: string;
	size: string;
}

export const FileHelper = {
	async getFileStatuses(downloadsFolder: string) {
		const fileNames = await fs.promises.readdir(downloadsFolder);
		const fileStatuses = await Promise.all(
			fileNames.map(fileName => fs.promises.stat(`${downloadsFolder}/${fileName}`)),
		);
		const owner = process.env.USER as string;
		const fileStatusesFormatted = fileStatuses.map<FileStatus>((fileStatus, index) => ({
			name: fileNames[index],
			owner,
			last_modified: fileStatus.birthtime.toISOString(),
			size: prettyBytes(fileStatus.size),
		}));
		return fileStatusesFormatted;
	},
};
