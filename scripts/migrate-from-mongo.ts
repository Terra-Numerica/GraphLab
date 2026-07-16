/**
 * One-shot migration script: MongoDB or deploy/graphs.json → app/backend/data/
 *
 * Usage:
 *   MONGODB_URL="mongodb+srv://..." npx tsx scripts/migrate-from-mongo.ts
 *   npx tsx scripts/migrate-from-mongo.ts --from-graphs-json path/to/graphs.json
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'app/backend/data');
const GRAPHS_DIR = path.join(DATA_DIR, 'graphs');

function normalizeDoc(doc: Record<string, unknown>): Record<string, unknown> {
	const result = { ...doc };
	delete result.__v;

	if (result._id && typeof result._id === 'object' && result._id !== null && '$oid' in result._id) {
		result._id = (result._id as { $oid: string }).$oid;
	} else if (result._id && typeof (result._id as { toString?: () => string }).toString === 'function') {
		result._id = (result._id as { toString: () => string }).toString();
	}

	for (const key of ['createdAt', 'updatedAt'] as const) {
		const value = result[key];
		if (value && typeof value === 'object' && '$date' in value) {
			result[key] = (value as { $date: string }).$date;
		} else if (value instanceof Date) {
			result[key] = value.toISOString();
		}
	}

	return result;
}

async function ensureDir(dir: string): Promise<void> {
	await fs.mkdir(dir, { recursive: true });
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
	await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

async function migrateGraphsFromJson(jsonPath: string): Promise<number> {
	const raw = await fs.readFile(jsonPath, 'utf-8');
	const graphs = JSON.parse(raw) as Record<string, unknown>[];

	await ensureDir(GRAPHS_DIR);

	for (const graph of graphs) {
		const normalized = normalizeDoc(graph);
		const id = normalized._id as string;
		if (!id) {
			console.warn('Skipping graph without _id:', normalized.name);
			continue;
		}
		await writeJson(path.join(GRAPHS_DIR, `${id}.json`), normalized);
	}

	return graphs.length;
}

async function migrateFromMongo(mongoUrl: string): Promise<void> {
	const { MongoClient } = await import('mongodb');
	const client = new MongoClient(mongoUrl);

	try {
		await client.connect();
		const db = client.db();

		const graphs = await db.collection('graphs').find().toArray();
		await ensureDir(GRAPHS_DIR);
		for (const graph of graphs) {
			const normalized = normalizeDoc(graph as Record<string, unknown>);
			const id = normalized._id as string;
			await writeJson(path.join(GRAPHS_DIR, `${id}.json`), normalized);
		}
		console.log(`Exported ${graphs.length} graphs`);

		const workshops = await db.collection('workshops').find().toArray();
		const normalizedWorkshops = workshops.map((w) => normalizeDoc(w as Record<string, unknown>));
		await writeJson(path.join(DATA_DIR, 'workshops.json'), normalizedWorkshops);
		console.log(`Exported ${workshops.length} workshops`);
	} finally {
		await client.close();
	}
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const fromGraphsJsonIndex = args.indexOf('--from-graphs-json');
	const graphsJsonPath =
		fromGraphsJsonIndex !== -1
			? path.resolve(ROOT, args[fromGraphsJsonIndex + 1])
			: null;

	await ensureDir(DATA_DIR);

	if (process.env.MONGODB_URL && fromGraphsJsonIndex === -1) {
		console.log('Migrating from MongoDB...');
		await migrateFromMongo(process.env.MONGODB_URL);
	} else if (graphsJsonPath) {
		console.log(`Migrating graphs from ${graphsJsonPath}...`);
		const count = await migrateGraphsFromJson(graphsJsonPath);
		console.log(`Exported ${count} graphs`);

		const workshopsPath = path.join(DATA_DIR, 'workshops.json');
		try {
			await fs.access(workshopsPath);
		} catch {
			await writeJson(workshopsPath, []);
			console.log('Created empty workshops.json');
		}
	} else {
		console.error('Provide MONGODB_URL or --from-graphs-json path/to/graphs.json');
		process.exit(1);
	}

	console.log(`Migration complete → ${DATA_DIR}`);
}

main().catch((err) => {
	console.error('Migration failed:', err);
	process.exit(1);
});
