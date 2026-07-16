export interface NodeData {
	id: string;
	label: string;
}

export interface GraphNode {
	data: NodeData;
	position: { x: number; y: number };
	group: string;
	removed: boolean;
	selected: boolean;
	selectable: boolean;
	locked: boolean;
	grabbable: boolean;
	pannable: boolean;
	classes: string;
}

export interface GraphEdge {
	data: {
		source: string;
		target: string;
		id: string;
		controlPointDistance: number;
		weight?: number;
	};
	position?: { x: number; y: number };
}

export interface ColoringWorkshopData {
	enabled: boolean;
	difficulty?: string;
	optimalCount?: number;
	tabletCounts?: Record<string, number>;
}

export interface EnabledWorkshopData {
	enabled: boolean;
}

export interface WorkshopDataSection {
	coloring?: ColoringWorkshopData;
	spanningTree?: EnabledWorkshopData;
	railwayMaze?: EnabledWorkshopData;
}

export interface GraphDocument {
	_id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	data: {
		nodes: GraphNode[];
		edges: GraphEdge[];
	};
	workshopData?: WorkshopDataSection;
}

export interface GraphInput {
	name: string;
	data: {
		nodes: GraphNode[];
		edges: GraphEdge[];
	};
	workshopData?: WorkshopDataSection;
}
