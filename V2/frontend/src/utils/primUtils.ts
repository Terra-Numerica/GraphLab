import { Node, Edge } from '../types';

interface PrimStep {
    edge?: Edge;
    action: string;
    node?: string;
    visitedNodes?: string[];
    componentColor?: string;
    explanation: string;
}

/**
 * @description The Prim algorithm
 * @param {Array} nodes - The nodes of the graph
 * @param {Array} edges - The edges of the graph
 * @returns {Array} The steps of the algorithm
*/
export const primAlgorithm = (nodes: Node[], edges: Edge[]): PrimStep[] => {
    const nodeCount = nodes.length;
    const nodeToIndex: Record<string, number> = {};
    const indexToNode: Record<number, string> = {};

    nodes.forEach((node: Node, index: number) => {
        nodeToIndex[node.data.id] = index;
        indexToNode[index] = node.data.id;
    });

    const G: number[][] = Array(nodeCount).fill(null).map(() => Array(nodeCount).fill(Infinity));
    edges.forEach((edge: Edge) => {
        const i = nodeToIndex[edge.data.source];
        const j = nodeToIndex[edge.data.target];
        G[i][j] = edge.data.weight || 0;
        G[j][i] = edge.data.weight || 0;
    });

    const visited: boolean[] = Array(nodeCount).fill(false);
    const steps: PrimStep[] = [];
    const componentColor = '#4ECDC4'; // Couleur de la composante en construction

    visited[0] = true;
    steps.push({
        action: 'start',
        node: indexToNode[0],
        visitedNodes: [indexToNode[0]],
        componentColor: componentColor,
        explanation: `On commence par la composante ${indexToNode[0]}.`
    });

    for (let k = 0; k < nodeCount - 1; k++) {
        let minD = Infinity;
        let minI = -1;
        let minJ = -1;

        for (let i = 0; i < nodeCount; i++) {
            if (visited[i]) {
                for (let j = 0; j < nodeCount; j++) {
                    if (!visited[j] && G[i][j] < minD) {
                        minD = G[i][j];
                        minI = i;
                        minJ = j;
                    }
                }
            }
        }

        if (minI === -1 || minJ === -1) break;

        const sourceId = indexToNode[minI];
        const targetId = indexToNode[minJ];
        const edge = edges.find((e: Edge) =>
            (e.data.source === sourceId && e.data.target === targetId) ||
            (e.data.source === targetId && e.data.target === sourceId)
        );

        // Ajouter le nouveau nœud à la liste des nœuds visités
        visited[minJ] = true;
        const visitedNodes: string[] = [];
        for (let i = 0; i < nodeCount; i++) {
            if (visited[i]) {
                visitedNodes.push(indexToNode[i]);
            }
        }

        steps.push({
            edge,
            action: 'add',
            visitedNodes: visitedNodes,
            componentColor: componentColor,
            explanation: `Ajout de l'arête ${sourceId}-${targetId} (poids : ${edge?.data.weight || 0}) car c'est l'arête de poids minimal reliant une composante visitée à une composante non visitée. La composante ${targetId} rejoint maintenant la composante en construction.`
        });
    }

    return steps;
}; 