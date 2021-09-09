import fs from 'fs';

import prettyBytes from 'pretty-bytes';

interface FileStatus {
	name: string;
	owner: string;
	last_modified: string;
	size: string;
}

export class FileHelper {
	static async getFileStatuses(downloadsDir: string) {
		const fileNames = await fs.promises.readdir(downloadsDir);
		const fileStatuses = await Promise.all(
			fileNames.map(fileName => fs.promises.stat(`${downloadsDir}/${fileName}`)),
		);
		const owner = process.env.USER as string;
		const fileStatusesFormatted = fileStatuses.map<FileStatus>((fileStatus, index) => ({
			name: fileNames[index],
			owner,
			last_modified: String(fileStatus.birthtime),
			size: prettyBytes(fileStatus.size),
		}));
		return fileStatusesFormatted;
	}
}
