import fs from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

export const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/;

export function getDataDir(): string {
	const dir = process.env.DATA_DIR || './data';
	return path.isAbsolute(dir) ? dir : path.resolve(process.cwd(), dir);
}

export function generateObjectId(): string {
	return randomBytes(12).toString('hex');
}

export function isValidObjectId(id: string): boolean {
	return OBJECT_ID_REGEX.test(id);
}

export async function ensureDir(dir: string): Promise<void> {
	await fs.mkdir(dir, { recursive: true });
}

export async function readJson<T>(filePath: string): Promise<T | null> {
	try {
		const content = await fs.readFile(filePath, 'utf-8');
		return JSON.parse(content) as T;
	} catch (error: unknown) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return null;
		}
		throw error;
	}
}

export async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
	await ensureDir(path.dirname(filePath));
	const tempPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
	await fs.writeFile(tempPath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
	await fs.rename(tempPath, filePath);
}

export async function listJsonFiles(dir: string): Promise<string[]> {
	try {
		const entries = await fs.readdir(dir);
		return entries.filter((f) => f.endsWith('.json'));
	} catch (error: unknown) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return [];
		}
		throw error;
	}
}

export function toIsoString(value: unknown): string {
	if (typeof value === 'string') return value;
	if (value instanceof Date) return value.toISOString();
	return new Date().toISOString();
}
