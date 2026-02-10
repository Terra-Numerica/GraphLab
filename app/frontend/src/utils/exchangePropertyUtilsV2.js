/**
 * @description Propriété d'échange — marche guidée (simplifiée + correction) :
 * - On démarre au 1er sommet
 * - On ajoute des arêtes façon Prim
 * - On force un cycle pour montrer la propriété d’échange
 * - On retire immédiatement l’arête la plus lourde
 * - On continue jusqu’à couvrir tous les sommets
 * - On ignore les arêtes déjà retirées (forbiddenEdges) pour éviter qu’elles réapparaissent
 *
 * @param {Array} nodes - [{ data: { id } }, ...]
 * @param {Array} edges - [{ data: { id, source, target, weight } }, ...]
 * @returns {Array} steps - (start, add, exchange, result, end)
 */
export const exchangePropertyAlgorithm = (nodes, edges) => {
    const nodeCount = nodes.length;
    const steps = [];
    const componentColor = '#4ECDC4';

    // Indexation
    const nodeToIndex = {};
    const indexToNode = {};
    nodes.forEach((node, index) => {
        nodeToIndex[node.data.id] = index;
        indexToNode[index] = node.data.id;
    });

    const idToEdge = new Map(edges.map(e => [e.data.id, e]));
    const visited = new Set();
    const inTree = new Set();
    const treeEdges = [];
    const adj = new Map();
    const forbiddenEdges = new Set(); // pour éviter de réutiliser une arête déjà retirée

    const addAdj = (u, v, eid) => {
        if (!adj.has(u)) adj.set(u, []);
        if (!adj.has(v)) adj.set(v, []);
        adj.get(u).push({ to: v, eid });
        adj.get(v).push({ to: u, eid });
    };

    const currentVisitedNodes = () => Array.from(visited);

    const pushAddStep = (edge, explanation) => {
        steps.push({
            action: 'add',
            edge,
            visitedNodes: currentVisitedNodes(),
            componentColor,
            explanation
        });
    };

    const pushExchangeStep = (edgeAdded, edgeRemoved, explanation) => {
        steps.push({
            action: 'exchange',
            edgeAdded,
            edgeRemoved,
            componentColor,
            explanation
        });
    };

    const pushResultStep = (explanation) => {
        steps.push({
            action: 'result',
            treeEdges: [...treeEdges],
            componentColor,
            explanation
        });
    };

    const findMinCrossEdge = () => {
        let best = null;
        for (const e of edges) {
            const uVis = visited.has(e.data.source);
            const vVis = visited.has(e.data.target);
            if (uVis !== vVis) {
                if (!best || e.data.weight < best.data.weight) best = e;
            }
        }
        return best;
    };

    const findLightestInternalNonTreeEdge = () => {
        let best = null;
        for (const e of edges) {
            const uVis = visited.has(e.data.source);
            const vVis = visited.has(e.data.target);
            const eid = e.data.id;
            if (uVis && vVis && !inTree.has(eid) && !forbiddenEdges.has(eid)) {
                if (!best || e.data.weight < best.data.weight) best = e;
            }
        }
        return best;
    };

    // Chemin u->v dans l’arbre courant
    const pathEdgeIdsInTree = (u, v) => {
        const stack = [u];
        const parent = new Map([[u, null]]);
        const parentEdge = new Map();
        while (stack.length) {
            const x = stack.pop();
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
        const path = [];
        let cur = v;
        while (parent.get(cur) !== null) {
            path.push(parentEdge.get(cur));
            cur = parent.get(cur);
        }
        path.reverse();
        return path;
    };

    const applyExchangeAfterAddingEdge = (edgeAdded) => {
        const u = edgeAdded.data.source;
        const v = edgeAdded.data.target;
        const pathIds = pathEdgeIdsInTree(u, v);
        if (!pathIds || pathIds.length === 0) return false;

        let toRemove = null;
        let maxW = -Infinity;
        for (const eid of pathIds) {
            const e = idToEdge.get(eid);
            if (e.data.weight > maxW) {
                maxW = e.data.weight;
                toRemove = e;
            }
        }

        // Retirer l’arête choisie
        inTree.delete(toRemove.data.id);
        forbiddenEdges.add(toRemove.data.id); // on interdit sa réutilisation
        const idx = treeEdges.findIndex(e => e.data.id === toRemove.data.id);
        if (idx >= 0) treeEdges.splice(idx, 1);
        const remU = toRemove.data.source, remV = toRemove.data.target;
        adj.set(remU, (adj.get(remU) || []).filter(x => x.eid !== toRemove.data.id));
        adj.set(remV, (adj.get(remV) || []).filter(x => x.eid !== toRemove.data.id));

        // Étape "exchange"
        pushExchangeStep(
            edgeAdded,
            toRemove,
            `L'ajout de ${u}-${v} (poids ${edgeAdded.data.weight}) crée un cycle. 
        On retire immédiatement l'arête la plus lourde du cycle : ${toRemove.data.source}-${toRemove.data.target} (poids ${toRemove.data.weight}).`
        );

        pushResultStep(`Après l'échange, l'arbre reste valide et sans cycle.`);
        return true;
    };

    // --- Start ---
    const startId = indexToNode[0];
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
