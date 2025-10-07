import { Node, Edge } from '../types';

/**
 * @description The UnionFind class
 * @param {number} size - The size of the UnionFind
 * @returns {Object} The UnionFind instance
*/
export class UnionFind {
    parent: number[];
    rank: number[];

    constructor(size: number) {
        this.parent = Array.from({ length: size }, (_, i) => i);
        this.rank = Array(size).fill(0);
    }

    /**
     * @description Find the root of a node
     * @param {number} x - The node to find the root of
     * @returns {number} The root of the node
    */
    find(x: number): number {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

    /**
     * @description Union two nodes
     * @param {number} x - The first node
     * @param {number} y - The second node
    */
    union(x: number, y: number): void {
        const rootX = this.find(x);
        const rootY = this.find(y);
        if (rootX === rootY) return;

        if (this.rank[rootX] < this.rank[rootY]) {
            this.parent[rootX] = rootY;
        } else if (this.rank[rootX] > this.rank[rootY]) {
            this.parent[rootY] = rootX;
        } else {
            this.parent[rootY] = rootX;
            this.rank[rootX]++;
        }
    }
}

interface KruskalStep {
    edge: Edge;
    action: string;
    explanation: string;
}

/**
 * @description The Kruskal algorithm
 * @param {Array} nodes - The nodes of the graph
 * @param {Array} edges - The edges of the graph
 * @returns {Array} The steps of the algorithm
*/
export const kruskalAlgorithm = (nodes: Node[], edges: Edge[]): KruskalStep[] => {
    const nodeCount = nodes.length;
    const uf = new UnionFind(nodeCount);
    const nodeToIndex: Record<string, number> = {};

    nodes.forEach((node: Node, index: number) => {
        nodeToIndex[node.data.id] = index;
    });

    const sortedEdges = [...edges].sort((a: Edge, b: Edge) => (a.data.weight || 0) - (b.data.weight || 0));
    const steps: KruskalStep[] = [];

    for (const edge of sortedEdges) {
        const sourceIndex = nodeToIndex[edge.data.source];
        const targetIndex = nodeToIndex[edge.data.target];

        if (uf.find(sourceIndex) !== uf.find(targetIndex)) {
            steps.push({
                edge,
                action: 'add',
                explanation: `Ajout de l'arête ${edge.data.source}-${edge.data.target} (poids : ${edge.data.weight || 0}) car elle relie deux composantes distinctes.`
            });
            uf.union(sourceIndex, targetIndex);
        }

        if (steps.length === nodeCount - 1) {
            break;
        }
    }

    return steps;
}; 