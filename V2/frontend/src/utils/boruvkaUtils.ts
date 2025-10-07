import { Node, Edge } from '../types';

interface AlgorithmStep {
    action: string;
    edge?: Edge;
    explanation: string;
}

/**
 * @description Find the root of a node in a tree
 * @param {Object} parent - The parent object
 * @param {string} i - The node to find the root of
 * @returns {string} The root of the node
*/
const find = (parent: Record<string, string>, i: string): string => {
    if (parent[i] !== i) {
        parent[i] = find(parent, parent[i]);
    }
    return parent[i];
};

/**
 * @description Union two nodes in a tree
 * @param {Object} parent - The parent object
 * @param {Object} rank - The rank object
 * @param {string} x - The first node
 * @param {string} y - The second node
*/
const union = (parent: Record<string, string>, rank: Record<string, number>, x: string, y: string): void => {
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

/**
 * @description Find the minimum edge for a component
 * @param {Array} edges - The edges of the graph
 * @param {Array} componentNodes - The nodes of the component
 * @param {Object} parent - The parent object
 * @returns {Object} The minimum edge
*/
const findMinEdgeForComponent = (edges: Edge[], componentNodes: string[], parent: Record<string, string>): Edge | null => {
    let minEdge: Edge | null = null;
    let minWeight = Infinity;

    edges.forEach((edge: Edge) => {
        const source = edge.data.source;
        const target = edge.data.target;
        const weight = edge.data.weight || 0;

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

/**
 * @description The Boruvka algorithm
 * @param {Array} nodes - The nodes of the graph
 * @param {Array} edges - The edges of the graph
 * @returns {Array} The steps of the algorithm
*/
export const boruvkaAlgorithm = (nodes: Node[], edges: Edge[]): AlgorithmStep[] => {
    const steps: AlgorithmStep[] = [];
    const parent: Record<string, string> = {};
    const rank: Record<string, number> = {};
    nodes.forEach((node: Node) => {
        parent[node.data.id] = node.data.id;
        rank[node.data.id] = 0;
    });
    let numComponents = nodes.length;

    steps.push({
        action: 'start',
        explanation: "Début de l'algorithme de Boruvka : chaque composante forme d'abord sa propre composante. À chaque étape, on va chercher à relier les composantes entre elles en choisissant l'arête de poids minimal qui les connecte."
    });

    while (numComponents > 1) {
        const components = new Map<string, string[]>();
        nodes.forEach((node: Node) => {
            const root = find(parent, node.data.id);
            if (!components.has(root)) {
                components.set(root, []);
            }
            components.get(root)!.push(node.data.id);
        });

        const minEdges = new Map<string, Edge>();
        components.forEach((componentNodes: string[], componentId: string) => {
            const minEdge = findMinEdgeForComponent(edges, componentNodes, parent);
            if (minEdge) {
                minEdges.set(componentId, minEdge);
            }
        });

        let merged = false;
        minEdges.forEach((edge: Edge, componentId: string) => {
            const source = edge.data.source;
            const target = edge.data.target;
            const sourceRoot = find(parent, source);
            const targetRoot = find(parent, target);

            if (sourceRoot !== targetRoot) {
                steps.push({
                    action: 'select_edge',
                    edge: edge,
                    explanation: `On sélectionne l'arête de poids minimal (${edge.data.weight || 0}) pour relier la composante ${componentId} à une autre. Cette arête est ajoutée à l'arbre couvrant, ce qui fusionne les deux composantes.`
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