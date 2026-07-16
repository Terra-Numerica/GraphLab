import path from 'path';
import fs from 'fs/promises';

import type { GraphDocument, GraphInput } from '@/types/graph.types';
import { applyGraphDefaults } from '@/storage/graphDefaults';
import {
	generateObjectId,
	getDataDir,
	isValidObjectId,
	listJsonFiles,
	readJson,
	toIsoString,
	writeJsonAtomic,
} from '@/storage/storageUtils';
import { validateGraphStructure } from '@/validators/graph.validator';

function graphsDir(): string {
	return path.join(getDataDir(), 'graphs');
}

function graphPath(id: string): string {
	return path.join(graphsDir(), `${id}.json`);
}

export async function findAllGraphs(): Promise<GraphDocument[]> {
	const files = await listJsonFiles(graphsDir());
	const graphs: GraphDocument[] = [];

	for (const file of files) {
		const id = file.replace(/\.json$/, '');
		if (!isValidObjectId(id)) continue;

		const graph = await readJson<GraphDocument>(graphPath(id));
		if (graph) {
			graphs.push(applyGraphDefaults(graph));
		}
	}

	return graphs.sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
	);
}

export async function findGraphById(id: string): Promise<GraphDocument | null> {
	if (!isValidObjectId(id)) return null;

	const graph = await readJson<GraphDocument>(graphPath(id));
	return graph ? applyGraphDefaults(graph) : null;
}

export async function createGraph(data: GraphInput): Promise<GraphDocument> {
	validateGraphStructure(data);

	const now = new Date().toISOString();
	const graph: GraphDocument = applyGraphDefaults({
		_id: generateObjectId(),
		name: data.name.trim(),
		createdAt: now,
		updatedAt: now,
		data: data.data,
		workshopData: data.workshopData,
	});

	await writeJsonAtomic(graphPath(graph._id), graph);
	return graph;
}

export async function updateGraph(id: string, data: GraphInput): Promise<GraphDocument | null> {
	if (!isValidObjectId(id)) return null;

	const existing = await readJson<GraphDocument>(graphPath(id));
	if (!existing) return null;

	validateGraphStructure(data);

	const updated: GraphDocument = applyGraphDefaults({
		...existing,
		name: data.name.trim(),
		data: data.data,
		workshopData: data.workshopData,
		updatedAt: new Date().toISOString(),
		createdAt: toIsoString(existing.createdAt),
	});

	await writeJsonAtomic(graphPath(id), updated);
	return updated;
}

export async function deleteGraph(id: string): Promise<boolean> {
	if (!isValidObjectId(id)) return false;

	try {
		await fs.unlink(graphPath(id));
		return true;
	} catch (error: unknown) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return false;
		}
		throw error;
	}
}
