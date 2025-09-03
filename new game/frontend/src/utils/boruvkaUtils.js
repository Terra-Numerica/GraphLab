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
        explanation: "Début de l'algorithme de Boruvka : chaque sommet forme d'abord sa propre composante. À chaque étape, on va chercher à relier les composantes entre elles en choisissant l'arête de poids minimal qui les connecte."
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
                    explanation: `On sélectionne l'arête de poids minimal (${edge.data.weight}) pour relier la composante ${componentId} à une autre. Cette arête est ajoutée à l'arbre couvrant, ce qui fusionne les deux composantes.`
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
        explanation: "Fin de l'algorithme de Boruvka : toutes les composantes sont maintenant connectées. L'arbre couvrant de poids minimal a été construit."
    });

    return steps;
}; 