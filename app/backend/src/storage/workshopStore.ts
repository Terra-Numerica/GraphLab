import path from 'path';

import type { WorkshopDocument, WorkshopInput } from '@/types/workshop.types';
import {
	generateObjectId,
	getDataDir,
	isValidObjectId,
	readJson,
	toIsoString,
	writeJsonAtomic,
} from '@/storage/storageUtils';

function workshopsFilePath(): string {
	return path.join(getDataDir(), 'workshops.json');
}

function defaultWorkshopFlags() {
	return { production: false, development: false };
}

function applyWorkshopDefaults(workshop: WorkshopDocument): WorkshopDocument {
	return {
		...workshop,
		coloring: workshop.coloring ?? defaultWorkshopFlags(),
		spanningTree: workshop.spanningTree ?? defaultWorkshopFlags(),
		railwayMaze: workshop.railwayMaze ?? defaultWorkshopFlags(),
	};
}

async function readWorkshops(): Promise<WorkshopDocument[]> {
	const data = await readJson<WorkshopDocument[]>(workshopsFilePath());
	if (!data) return [];
	return data.map(applyWorkshopDefaults);
}

async function writeWorkshops(workshops: WorkshopDocument[]): Promise<void> {
	await writeJsonAtomic(workshopsFilePath(), workshops);
}

export async function findAllWorkshops(): Promise<WorkshopDocument[]> {
	const workshops = await readWorkshops();
	return workshops.sort(
		(a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
	);
}

export async function findWorkshopById(id: string): Promise<WorkshopDocument | null> {
	if (!isValidObjectId(id)) return null;
	const workshops = await readWorkshops();
	return workshops.find((w) => w._id === id) ?? null;
}

export async function createWorkshop(data: WorkshopInput): Promise<WorkshopDocument> {
	const workshops = await readWorkshops();
	const now = new Date().toISOString();

	const workshop: WorkshopDocument = applyWorkshopDefaults({
		_id: generateObjectId(),
		...data,
		createdAt: now,
		updatedAt: now,
	});

	workshops.push(workshop);
	await writeWorkshops(workshops);
	return workshop;
}

export async function updateWorkshop(id: string, data: WorkshopInput): Promise<WorkshopDocument | null> {
	if (!isValidObjectId(id)) return null;

	const workshops = await readWorkshops();
	const index = workshops.findIndex((w) => w._id === id);
	if (index === -1) return null;

	const updated: WorkshopDocument = applyWorkshopDefaults({
		...workshops[index],
		...data,
		updatedAt: new Date().toISOString(),
		createdAt: toIsoString(workshops[index].createdAt),
	});

	workshops[index] = updated;
	await writeWorkshops(workshops);
	return updated;
}

export async function deleteWorkshop(id: string): Promise<boolean> {
	if (!isValidObjectId(id)) return false;

	const workshops = await readWorkshops();
	const filtered = workshops.filter((w) => w._id !== id);
	if (filtered.length === workshops.length) return false;

	await writeWorkshops(filtered);
	return true;
}
