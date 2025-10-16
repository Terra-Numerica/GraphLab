/**
 * @description Pas-à-pas : propriété d'échange (ordre imposé des arêtes)
 * @param {Array} nodes  - [{ data:{ id }}, ...]
 * @param {Array} edges  - [{ data:{ source, target, weight }}, ...]
 * @param {'ALEATOIRE'|'CROISSANT'|'DECROISSANT'} order
 * @returns {Array} steps
 *
 * Notes UI:
 *  - steps[i].action ∈ { 'start','order','select','add','cycle','exchange','discard','tree-reached','done-processing','stop' }
 *  - À chaque step : keptEdges = arêtes conservées (à colorer), discardedEdges = arêtes grisées (non sélectionnables),
 *    components = liste des composantes pour affichage "(n1,n2) ~ (n3) ~ ..."
 */
export const exchangePropertyAlgorithm = (nodes, edges, order = 'CROISSANT') => {
    // ---------- helpers
    const key = (e) => {
        const a = e.data.source, b = e.data.target;
        return a < b ? `${a}|${b}` : `${b}|${a}`;
    };

    const clone = (arr) => arr.map(e => ({ ...e, data: { ...e.data } }));

    const shuffle = (arr) => { // Fisher–Yates
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    };

    const orderEdges = () => {
        const a = clone(edges);
        if (order === 'ALEATOIRE') { shuffle(a); return a; }
        a.sort((e1, e2) => {
            if (e1.data.weight === e2.data.weight) {
                // tri secondaire stable pour reproductibilité
                return key(e1) < key(e2) ? -1 : 1;
            }
            return order === 'CROISSANT'
                ? e1.data.weight - e2.data.weight
                : e2.data.weight - e1.data.weight;
        });
        return a;
    };

    // --- adjacence de la forêt courante (uniquement arêtes conservées)
    const adj = new Map(); // nodeId -> [{to, edge}]
    const addAdj = (a, b, e) => { if (!adj.has(a)) adj.set(a, []); adj.get(a).push({ to: b, edge: e }); };
    const rmAdj = (a, b, ek) => { if (!adj.has(a)) return; adj.set(a, adj.get(a).filter(({ to, edge }) => !(to === b && key(edge) === ek))); };
    const addForest = (e) => { addAdj(e.data.source, e.data.target, e); addAdj(e.data.target, e.data.source, e); };
    const rmForest = (e) => { const k = key(e); rmAdj(e.data.source, e.data.target, k); rmAdj(e.data.target, e.data.source, k); };

    // --- composantes connexes pour affichage
    const components = () => {
        const ids = nodes.map(n => n.data.id);
        const seen = new Set();
        const neigh = (x) => (adj.get(x) || []).map(o => o.to);
        const out = [];
        for (const n of ids) {
            if (seen.has(n)) continue;
            const comp = [];
            const st = [n];
            seen.add(n);
            while (st.length) {
                const x = st.pop();
                comp.push(x);
                for (const y of neigh(x)) if (!seen.has(y)) { seen.add(y); st.push(y); }
            }
            out.push(comp.sort());
        }
        return out.sort((A, B) => A[0].localeCompare(B[0]));
    };

    // --- chemin u→v dans la forêt courante (DFS), renvoie la liste d'ARÊTES
    const pathEdges = (u, v) => {
        const stack = [[u]];
        const parent = new Map([[u, { p: null, pe: null }]]);
        while (stack.length) {
            const [x] = stack.pop();
            if (x === v) break;
            (adj.get(x) || []).forEach(({ to, edge }) => {
                if (!parent.has(to)) { parent.set(to, { p: x, pe: edge }); stack.push([to]); }
            });
        }
        if (!parent.has(v)) return null;
        const path = [];
        let cur = v;
        while (parent.get(cur).p !== null) { path.push(parent.get(cur).pe); cur = parent.get(cur).p; }
        path.reverse();
        return path;
    };

    // ---------- état de l'algo
    const steps = [];
    const kept = new Set();
    const discarded = new Set();
    let compCount = nodes.length;
    let treeReached = false;

    const ordered = orderEdges();
    const listOrderStr = ordered.map(e => `${e.data.source}-${e.data.target}(${e.data.weight})`).join(', ');

    steps.push({
        action: 'start',
        order,
        componentCount: compCount,
        keptEdges: [],
        discardedEdges: [],
        components: nodes.map(n => [n.data.id]),
        explanation: `Départ : ${compCount} composantes. Sélection des arêtes en ordre ${order.toLowerCase()}.`
    });
    steps.push({
        action: 'order',
        order,
        explanation: `Ordre de traitement des arêtes : ${listOrderStr}.`
    });

    // ---------- boucle principale : on traite TOUTES les arêtes
    for (const e of ordered) {
        const k = key(e);

        steps.push({
            action: 'select',
            edge: e,
            componentCount: compCount,
            keptEdges: edges.filter(x => kept.has(key(x))),
            discardedEdges: edges.filter(x => discarded.has(key(x))),
            components: components(),
            explanation: `Sélection de l'arête ${e.data.source}-${e.data.target} (poids ${e.data.weight}).`
        });

        const u = e.data.source, v = e.data.target;
        const path = pathEdges(u, v);

        if (!path) {
            // Pas de cycle → on garde e et on fusionne deux composantes
            addForest(e);
            kept.add(k);
            compCount -= 1;

            steps.push({
                action: 'add',
                edge: e,
                componentCount: compCount,
                keptEdges: edges.filter(x => kept.has(key(x))),
                discardedEdges: edges.filter(x => discarded.has(key(x))),
                components: components(),
                explanation: `Aucun cycle créé : on réduit à ${compCount} composantes, l'arête est conservée.`
            });

            // on note la première fois où on atteint un arbre, mais on CONTINUE
            if (!treeReached && kept.size === nodes.length - 1) {
                treeReached = true;
                steps.push({
                    action: 'tree-reached',
                    componentCount: compCount,
                    keptEdges: edges.filter(x => kept.has(key(x))),
                    discardedEdges: edges.filter(x => discarded.has(key(x))),
                    components: components(),
                    explanation: `Arbre couvrant atteint (${kept.size} arêtes). On continue pour traiter toutes les arêtes.`
                });
            }
        } else {
            // Cycle → appliquer la propriété d'échange
            steps.push({
                action: 'cycle',
                edge: e,
                cycleEdges: [...path, e],
                componentCount: compCount,
                keptEdges: edges.filter(x => kept.has(key(x))),
                discardedEdges: edges.filter(x => discarded.has(key(x))),
                components: components(),
                explanation: `Cycle créé : on cherche l'arête qui possède le poids le plus élevé.`
            });

            const maxOnPath = Math.max(...path.map(pe => pe.data.weight));

            // Politique pédagogique : si w(e) est >= au max du chemin, on rejette e (on veut "voir" l'échange/rejet).
            if (e.data.weight >= maxOnPath) {
                discarded.add(k);
                steps.push({
                    action: 'discard',
                    edge: e,
                    componentCount: compCount,
                    keptEdges: edges.filter(x => kept.has(key(x))),
                    discardedEdges: edges.filter(x => discarded.has(key(x))),
                    components: components(),
                    explanation: `On retire ${e.data.source}-${e.data.target} qui est de poids ${e.data.weight} (poids le plus élevé du cycle).`
                });
            } else {
                // retirer une arête maximale du chemin (la première rencontrée)
                const toRemove = path.find(pe => pe.data.weight === maxOnPath);
                rmForest(toRemove);
                kept.delete(key(toRemove));

                addForest(e);
                kept.add(k);

                steps.push({
                    action: 'exchange',
                    add: e,
                    remove: toRemove,
                    componentCount: compCount, // inchangé
                    keptEdges: edges.filter(x => kept.has(key(x))),
                    discardedEdges: edges.filter(x => discarded.has(key(x))),
                    components: components(),
                    explanation: `On retire ${toRemove.data.source}-${toRemove.data.target} (poids ${toRemove.data.weight}) — plus lourd du cycle — et on conserve ${e.data.source}-${e.data.target}.`
                });
            }
        }
    }

    // --- fin : toutes les arêtes ont été traitées
    if (kept.size < nodes.length - 1) {
        steps.push({
            action: 'stop',
            componentCount: compCount,
            keptEdges: edges.filter(x => kept.has(key(x))),
            discardedEdges: edges.filter(x => discarded.has(key(x))),
            components: components(),
            explanation: `Fin des arêtes : le graphe semble non connexe (arêtes conservées: ${kept.size}).`
        });
    }

    steps.push({
        action: 'done-processing',
        componentCount: compCount,
        keptEdges: edges.filter(x => kept.has(key(x))),
        discardedEdges: edges.filter(x => discarded.has(key(x))),
        components: components(),
        explanation: `Toutes les arêtes ont été traitées.`
    });

    return steps;
};