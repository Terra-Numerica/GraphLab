import path from 'path';

import Logger from '@/base/Logger';
import { ensureDir, getDataDir } from '@/storage/storageUtils';

export async function initStorage(): Promise<void> {
	const dataDir = getDataDir();
	await ensureDir(dataDir);
	await ensureDir(path.join(dataDir, 'graphs'));

	Logger.info(`Data directory: ${dataDir}`);
}
