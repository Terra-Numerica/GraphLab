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
    const componentColor = '#4ECDC4'; // Couleur de la composante en construction

    visited[0] = true;
    steps.push({
        action: 'start',
        node: indexToNode[0],
        visitedNodes: [indexToNode[0]],
        componentColor: componentColor,
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

        // Ajouter le nouveau nœud à la liste des nœuds visités
        visited[minJ] = true;
        const visitedNodes = [];
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
            explanation: `Ajout de l'arête ${sourceId}-${targetId} (poids : ${edge.data.weight}) car c'est l'arête de poids minimal reliant un sommet visité à un sommet non visité. Le sommet ${targetId} rejoint maintenant la composante en construction.`
        });
    }

    return steps;
}; 