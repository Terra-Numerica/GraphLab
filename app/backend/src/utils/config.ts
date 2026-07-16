// Imports
import { constants } from 'fs';
import fs from 'fs/promises';

import { z } from 'zod';

import { getDataDir } from '@/storage/storageUtils';

const envSchema = z.object({
	PORT: z.string().min(1, 'Port must be at least 1 character long'),
	DATA_DIR: z.string().min(1, 'Data directory must be at least 1 character long').optional(),
	NODE_ENV: z.string().min(1, 'Node Environment must be at least 1 character long'),
	ADMIN_USERNAME: z.string().min(1, 'ADMIN_USERNAME is required'),
	ADMIN_PASSWORD: z.string().min(1, 'ADMIN_PASSWORD is required'),
});

// Export
export const checkConfig = async (): Promise<void> => {
	try {
		envSchema.parse(process.env);

		const dataDir = getDataDir();
		await fs.mkdir(dataDir, { recursive: true });
		await fs.access(dataDir, constants.R_OK | constants.W_OK);
	} catch (error: any) {
		throw new Error(error);
	}
};
