const find = (parent, i) => {
    if (parent[i] !== i) {
        parent[i] = find(parent, parent[i]);
    }
    return parent[i];
};

const union = (parent, rank, x, y) => {
    const rootX = find(parent, x);
    const rootY = find(parent, y);

    if (rootX === rootY) return;

    if (rank[rootX] < rank[rootY]) {
        parent[rootX] = rootY;
    } else if (rank[rootX] > rank[rootY]) {
        parent[rootY] = rootX;
    } else {
        parent[rootY] = rootX;
        rank[rootX]++;
    }
};

const findMinEdgeForComponent = (edges, componentNodes, parent) => {
    let minEdge = null;
    let minWeight = Infinity;

    edges.forEach(edge => {
        const source = edge.data.source;
        const target = edge.data.target;
        const weight = edge.data.weight;

        const sourceInComponent = componentNodes.includes(source);
        const targetInComponent = componentNodes.includes(target);
        if ((sourceInComponent && !targetInComponent) || (!sourceInComponent && targetInComponent)) {
            if (find(parent, source) !== find(parent, target) && weight < minWeight) {
                minWeight = weight;
                minEdge = edge;
            }
        }
    });

    return minEdge;
};

export const boruvkaAlgorithm = (nodes, edges) => {
    const steps = [];
    const parent = {};
    const rank = {};
    nodes.forEach(node => {
        parent[node.data.id] = node.data.id;
        rank[node.data.id] = 0;
    });
    let numComponents = nodes.length;

    steps.push({
        action: 'start',
        explanation: "Début de l'algorithme de Boruvka. Chaque nœud forme sa propre composante."
    });

    while (numComponents > 1) {
        const components = new Map();
        nodes.forEach(node => {
            const root = find(parent, node.data.id);
            if (!components.has(root)) {
                components.set(root, []);
            }
            components.get(root).push(node.data.id);
        });

        const minEdges = new Map();
        components.forEach((componentNodes, componentId) => {
            const minEdge = findMinEdgeForComponent(edges, componentNodes, parent);
            if (minEdge) {
                minEdges.set(componentId, minEdge);
            }
        });

        let merged = false;
        minEdges.forEach((edge, componentId) => {
            const source = edge.data.source;
            const target = edge.data.target;
            const sourceRoot = find(parent, source);
            const targetRoot = find(parent, target);

            if (sourceRoot !== targetRoot) {
                steps.push({
                    action: 'select_edge',
                    edge: edge,
                    explanation: `Sélection de l'arête de poids minimum (${edge.data.weight}) pour la composante ${componentId}`
                });
                union(parent, rank, source, target);
                numComponents--;
                merged = true;
            }
        });

        if (!merged) {
            break;
        }
    }

    steps.push({
        action: 'end',
        explanation: "L'algorithme de Boruvka est terminé. L'arbre couvrant minimum a été trouvé."
    });

    return steps;
}; 