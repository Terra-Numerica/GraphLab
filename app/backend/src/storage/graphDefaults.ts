import type { GraphDocument, WorkshopDataSection } from '@/types/graph.types';

export function defaultWorkshopData(): WorkshopDataSection {
	return {
		coloring: { enabled: false },
		spanningTree: { enabled: false },
		railwayMaze: { enabled: false },
	};
}

export function applyGraphDefaults(graph: GraphDocument): GraphDocument {
	const workshopData = graph.workshopData ?? {};

	return {
		...graph,
		workshopData: {
			coloring: workshopData.coloring ?? { enabled: false },
			spanningTree: workshopData.spanningTree ?? { enabled: false },
			railwayMaze: workshopData.railwayMaze ?? { enabled: false },
		},
	};
}
