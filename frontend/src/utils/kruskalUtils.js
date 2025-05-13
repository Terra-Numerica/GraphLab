export class UnionFind {
    constructor(size) {
        this.parent = Array.from({ length: size }, (_, i) => i);
        this.rank = Array(size).fill(0);
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

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