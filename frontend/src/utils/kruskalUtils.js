/**
 * @description The UnionFind class
 * @param {number} size - The size of the UnionFind
 * @returns {Object} The UnionFind instance
*/
export class UnionFind {
    constructor(size) {
        this.parent = Array.from({ length: size }, (_, i) => i);
        this.rank = Array(size).fill(0);
    }

    /**
     * @description Find the root of a node
     * @param {number} x - The node to find the root of
     * @returns {number} The root of the node
    */
    find(x) {
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
    union(x, y) {
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

/**
 * @description The Kruskal algorithm
 * @param {Array} nodes - The nodes of the graph
 * @param {Array} edges - The edges of the graph
 * @returns {Array} The steps of the algorithm
*/
export const kruskalAlgorithm = (nodes, edges) => {
    const nodeCount = nodes.length;
    const uf = new UnionFind(nodeCount);
    const nodeToIndex = {};

    nodes.forEach((node, index) => {
        nodeToIndex[node.data.id] = index;
    });

    const sortedEdges = [...edges].sort((a, b) => a.data.weight - b.data.weight);
    const steps = [];

    for (const edge of sortedEdges) {
        const sourceIndex = nodeToIndex[edge.data.source];
        const targetIndex = nodeToIndex[edge.data.target];

        if (uf.find(sourceIndex) !== uf.find(targetIndex)) {
            steps.push({
                edge,
                action: 'add',
                explanation: `Ajout de l'arête ${edge.data.source}-${edge.data.target} (poids : ${edge.data.weight}) car elle relie deux composantes distinctes.`
            });
            uf.union(sourceIndex, targetIndex);
        }

        if (steps.length === nodeCount - 1) {
            break;
        }
    }

    return steps;
}; 