import { Node, Edge } from '../types';

interface ExchangeV1Step {
    action: string;
    edge?: Edge;
    edgeAdded?: Edge;
    edgeRemoved?: Edge;
    node?: string;
    visitedNodes?: string[];
    treeEdges?: Edge[];
    componentColor?: string;
    explanation: string;
}

/**
 * @description Propriété d'échange — marche guidée (version simplifiée) :
 * On démarre au 1er sommet, on ajoute quelques arêtes "façon Prim",
 * puis on force l'ajout d'une arête qui crée un cycle,
 * on applique directement la propriété d'échange (retrait de la plus lourde),
 * et on continue jusqu'à couvrir tout le graphe.
 *
 * Étapes de cycle : seulement 3 ("add", "exchange", "result").
 *
 * @param {Array} nodes - [{ data: { id } }, ...]
 * @param {Array} edges - [{ data: { id, source, target, weight } }, ...]
 * @returns {Array} steps - trace simplifiée (start, add, exchange, result, end)
 */
export const exchangePropertyAlgorithm = (nodes: Node[], edges: Edge[]): ExchangeV1Step[] => {
    const nodeCount = nodes.length;
    const steps: ExchangeV1Step[] = [];
    const componentColor = '#4ECDC4';

    // Indexation
    const nodeToIndex: Record<string, number> = {};
    const indexToNode: Record<number, string> = {};
    nodes.forEach((node: Node, index: number) => {
        nodeToIndex[node.data.id] = index;
        indexToNode[index] = node.data.id;
    });

    const idToEdge = new Map(edges.map((e: Edge) => [e.data.id, e]));
    const visited = new Set<string>();
    const inTree = new Set<string>();
    const treeEdges: Edge[] = [];
    const adj = new Map<string, { to: string; eid: string }[]>();

    const addAdj = (u: string, v: string, eid: string): void => {
        if (!adj.has(u)) adj.set(u, []);
        if (!adj.has(v)) adj.set(v, []);
        adj.get(u)!.push({ to: v, eid });
        adj.get(v)!.push({ to: u, eid });
    };

    const currentVisitedNodes = (): string[] => Array.from(visited);

    const pushAddStep = (edge: Edge, explanation: string): void => {
        steps.push({
            action: 'add',
            edge,
            visitedNodes: currentVisitedNodes(),
            componentColor,
            explanation
        });
    };

    const pushExchangeStep = (edgeAdded: Edge, edgeRemoved: Edge, explanation: string): void => {
        steps.push({
            action: 'exchange',
            edgeAdded,
            edgeRemoved,
            componentColor,
            explanation
        });
    };

    const pushResultStep = (explanation: string): void => {
        steps.push({
            action: 'result',
            treeEdges: [...treeEdges],
            componentColor,
            explanation
        });
    };

    const findMinCrossEdge = (): Edge | null => {
        let best: Edge | null = null;
        for (const e of edges) {
            const uVis = visited.has(e.data.source);
            const vVis = visited.has(e.data.target);
            if (uVis !== vVis) {
                if (!best || (e.data.weight || 0) < (best.data.weight || 0)) best = e;
            }
        }
        return best;
    };

    const findLightestInternalNonTreeEdge = (): Edge | null => {
        let best: Edge | null = null;
        for (const e of edges) {
            const uVis = visited.has(e.data.source);
            const vVis = visited.has(e.data.target);
            const eid = e.data.id;
            if (uVis && vVis && !inTree.has(eid)) {
                if (!best || (e.data.weight || 0) < (best.data.weight || 0)) best = e;
            }
        }
        return best;
    };

    // Chemin u->v dans l'arbre courant
    const pathEdgeIdsInTree = (u: string, v: string): string[] | null => {
        const stack = [u];
        const parent = new Map<string, string | null>([[u, null]]);
        const parentEdge = new Map<string, string>();
        while (stack.length) {
            const x = stack.pop()!;
            if (x === v) break;
            for (const { to, eid } of (adj.get(x) || [])) {
                if (!parent.has(to)) {
                    parent.set(to, x);
                    parentEdge.set(to, eid);
                    stack.push(to);
                }
            }
        }
        if (!parent.has(v)) return null;
        const path: string[] = [];
        let cur = v;
        while (parent.get(cur) !== null) {
            path.push(parentEdge.get(cur)!);
            cur = parent.get(cur)!;
        }
        path.reverse();
        return path;
    };

    const applyExchangeAfterAddingEdge = (edgeAdded: Edge): boolean => {
        const u = edgeAdded.data.source;
        const v = edgeAdded.data.target;
        const pathIds = pathEdgeIdsInTree(u, v);
        if (!pathIds || pathIds.length === 0) return false;

        let toRemove: Edge | null = null;
        let maxW = -Infinity;
        for (const eid of pathIds) {
            const e = idToEdge.get(eid);
            if (e && (e.data.weight || 0) > maxW) {
                maxW = e.data.weight || 0;
                toRemove = e;
            }
        }

        // Retirer l'arête choisie
        if (toRemove) {
            inTree.delete(toRemove.data.id);
            const idx = treeEdges.findIndex((e: Edge) => e.data.id === toRemove.data.id);
            if (idx >= 0) treeEdges.splice(idx, 1);
            const remU = toRemove.data.source, remV = toRemove.data.target;
            adj.set(remU, (adj.get(remU) || []).filter((x: { to: string; eid: string }) => x.eid !== toRemove.data.id));
            adj.set(remV, (adj.get(remV) || []).filter((x: { to: string; eid: string }) => x.eid !== toRemove.data.id));
        }

        // Étape unique "exchange"
        if (toRemove) {
            pushExchangeStep(
                edgeAdded,
                toRemove,
                `L'ajout de ${u}-${v} (poids ${edgeAdded.data.weight}) crée un cycle. 
            On retire immédiatement l'arête la plus lourde du cycle : ${toRemove.data.source}-${toRemove.data.target} (poids ${toRemove.data.weight}).`
            );
        }

        // Résultat
        pushResultStep(`Après l'échange, l'arbre reste valide et sans cycle.`);
        return true;
    };

    // --- Start ---
    const startId = indexToNode[0]!;
    visited.add(startId);
    steps.push({
        action: 'start',
        node: startId,
        visitedNodes: currentVisitedNodes(),
        componentColor,
        explanation: `On commence par le sommet ${startId}.`
    });

    // --- Deux premières arêtes façon Prim ---
    for (let k = 0; k < Math.min(2, nodeCount - 1); k++) {
        const best = findMinCrossEdge();
        if (!best) break;
        const u = best.data.source, v = best.data.target;
        const newNode = visited.has(u) ? v : u;
        visited.add(newNode);
        inTree.add(best.data.id);
        treeEdges.push(best);
        addAdj(u, v, best.data.id);
        pushAddStep(
            best,
            `Ajout de l'arête ${u}-${v} (poids : ${best.data.weight}) pour étendre l'arbre vers un nouveau sommet.`
        );
    }

    // --- Forcer un cycle ---
    const internal = findLightestInternalNonTreeEdge();
    if (internal) {
        inTree.add(internal.data.id);
        treeEdges.push(internal);
        addAdj(internal.data.source, internal.data.target, internal.data.id);
        applyExchangeAfterAddingEdge(internal);
    }

    // --- Continuer façon Prim jusqu’à couvrir tous les sommets ---
    while (treeEdges.length < nodeCount - 1) {
        const best = findMinCrossEdge();
        if (!best) break;
        const u = best.data.source, v = best.data.target;
        const newNode = visited.has(u) ? v : u;
        visited.add(newNode);
        inTree.add(best.data.id);
        treeEdges.push(best);
        addAdj(u, v, best.data.id);
        pushAddStep(
            best,
            `Ajout de l'arête ${u}-${v} (poids : ${best.data.weight}) pour connecter un nouveau sommet.`
        );
    }

    // --- Tentative finale (arête hors-arbre) ---
    const extra = findLightestInternalNonTreeEdge();
    if (extra) {
        inTree.add(extra.data.id);
        treeEdges.push(extra);
        addAdj(extra.data.source, extra.data.target, extra.data.id);
        applyExchangeAfterAddingEdge(extra);
    }

    // --- End ---
    steps.push({
        action: 'end',
        componentColor,
        explanation: `Fin : tous les sommets sont reliés sans cycle. La propriété d'échange a été appliquée dès qu'un cycle est apparu.`
    });

    return steps;
};