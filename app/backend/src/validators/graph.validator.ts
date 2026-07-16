import type { GraphEdge, GraphInput, GraphNode } from '@/types/graph.types';

const DIFFICULTY_LEVELS = [
	'Très facile',
	'Facile',
	'Moyen',
	'Difficile',
	'Impossible-preuve-facile',
	'Impossible-preuve-difficile',
] as const;

function isValidNode(node: GraphNode): boolean {
	return (
		typeof node.data?.id === 'string' &&
		typeof node.data?.label === 'string' &&
		typeof node.position?.x === 'number' &&
		typeof node.position?.y === 'number' &&
		typeof node.removed === 'boolean' &&
		typeof node.selected === 'boolean' &&
		typeof node.selectable === 'boolean' &&
		typeof node.locked === 'boolean' &&
		typeof node.grabbable === 'boolean' &&
		typeof node.pannable === 'boolean' &&
		typeof node.group === 'string' &&
		typeof node.classes === 'string'
	);
}

function isValidEdge(edge: GraphEdge): boolean {
	const hasValidData =
		typeof edge.data?.source === 'string' &&
		typeof edge.data?.target === 'string' &&
		typeof edge.data?.id === 'string' &&
		typeof edge.data?.controlPointDistance === 'number';

	const hasValidWeight = edge.data?.weight === undefined || typeof edge.data.weight === 'number';

	const hasValidPosition =
		!edge.position ||
		(typeof edge.position.x === 'number' && typeof edge.position.y === 'number');

	return Boolean(hasValidData && hasValidWeight && hasValidPosition);
}

export function validateGraphStructure(data: GraphInput): void {
	const { nodes, edges } = data.data;

	if (!nodes?.length) {
		throw new Error('Le graphe doit contenir au moins un nœud');
	}

	if (!nodes.every(isValidNode)) {
		throw new Error('Structure de nœud invalide');
	}

	if (!edges?.every(isValidEdge)) {
		throw new Error("Structure d'arête invalide");
	}

	const nodeIds = new Set(nodes.map((node) => node.data.id));
	const edgesValid = edges.every(
		(edge) => nodeIds.has(edge.data.source) && nodeIds.has(edge.data.target)
	);

	if (!edgesValid) {
		throw new Error("Les arêtes référencent des nœuds qui n'existent pas");
	}

	const coloring = data.workshopData?.coloring;
	if (coloring?.enabled) {
		if (!coloring.difficulty || !DIFFICULTY_LEVELS.includes(coloring.difficulty as typeof DIFFICULTY_LEVELS[number])) {
			throw new Error('Le niveau de difficulté est requis quand la coloration est activée');
		}
		if (coloring.optimalCount === undefined || !Number.isInteger(coloring.optimalCount) || coloring.optimalCount < 1) {
			throw new Error('Le nombre optimal de couleurs est requis quand la coloration est activée');
		}
		if (!coloring.tabletCounts) {
			throw new Error('Le compte des pastilles est requis quand la coloration est activée');
		}
		const countsValid = Object.values(coloring.tabletCounts).every(
			(count) => typeof count === 'number' && count >= 0 && Number.isInteger(count)
		);
		if (!countsValid) {
			throw new Error('Les comptes de pastilles doivent être des nombres entiers positifs');
		}
	}
}
