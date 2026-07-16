export interface WorkshopEnvironmentFlags {
	production: boolean;
	development: boolean;
}

export interface WorkshopDocument {
	_id: string;
	coloring: WorkshopEnvironmentFlags;
	spanningTree: WorkshopEnvironmentFlags;
	railwayMaze: WorkshopEnvironmentFlags;
	createdAt: string;
	updatedAt: string;
}

export interface WorkshopInput {
	coloring: WorkshopEnvironmentFlags;
	spanningTree: WorkshopEnvironmentFlags;
	railwayMaze: WorkshopEnvironmentFlags;
}
