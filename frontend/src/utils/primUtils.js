/**
 * @description The Prim algorithm
 * @param {Array} nodes - The nodes of the graph
 * @param {Array} edges - The edges of the graph
 * @returns {Array} The steps of the algorithm
*/
export const primAlgorithm = (nodes, edges) => {
    const nodeCount = nodes.length;
    const nodeToIndex = {};
    const indexToNode = {};

    nodes.forEach((node, index) => {
        nodeToIndex[node.data.id] = index;
        indexToNode[index] = node.data.id;
    });

    const G = Array(nodeCount).fill().map(() => Array(nodeCount).fill(Infinity));
    edges.forEach(edge => {
        const i = nodeToIndex[edge.data.source];
        const j = nodeToIndex[edge.data.target];
        G[i][j] = edge.data.weight;
        G[j][i] = edge.data.weight;
    });

    const visited = Array(nodeCount).fill(false);
    const steps = [];

    visited[0] = true;
    steps.push({
        action: 'start',
        node: indexToNode[0],
        explanation: `On commence par le sommet ${indexToNode[0]}.`
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
        const edge = edges.find(e =>
            (e.data.source === sourceId && e.data.target === targetId) ||
            (e.data.source === targetId && e.data.target === sourceId)
        );

        steps.push({
            edge,
            action: 'add',
            explanation: `Ajout de l'arête ${sourceId}-${targetId} (poids : ${edge.data.weight}) car c'est l'arête de poids minimal reliant un sommet visité à un sommet non visité.`
        });

        visited[minJ] = true;
    }

    return steps;
}; 