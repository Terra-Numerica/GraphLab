import { Node, Edge } from '../types';

type OrderType = 'ALEATOIRE' | 'CROISSANT' | 'DECROISSANT';

interface ExchangeStep {
    action: string;
    edge?: Edge;
    order?: OrderType;
    componentCount?: number;
    keptEdges?: Edge[];
    discardedEdges?: Edge[];
    components?: string[][];
    cycleEdges?: Edge[];
    add?: Edge;
    remove?: Edge;
    explanation: string;
}

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
export const exchangePropertyAlgorithm = (nodes: Node[], edges: Edge[], order: OrderType = 'CROISSANT'): ExchangeStep[] => {
    // ---------- helpers
    const key = (e: Edge): string => {
        const a = e.data.source, b = e.data.target;
        return a < b ? `${a}|${b}` : `${b}|${a}`;
    };

    const clone = (arr: Edge[]): Edge[] => arr.map((e: Edge) => ({ ...e, data: { ...e.data } }));

    const shuffle = (arr: Edge[]): void => { // Fisher–Yates
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    };

    const orderEdges = (): Edge[] => {
        const a = clone(edges);
        if (order === 'ALEATOIRE') { shuffle(a); return a; }
        a.sort((e1: Edge, e2: Edge) => {
            const w1 = e1.data.weight || 0;
            const w2 = e2.data.weight || 0;
            if (w1 === w2) {
                // tri secondaire stable pour reproductibilité
                return key(e1) < key(e2) ? -1 : 1;
            }
            return order === 'CROISSANT'
                ? w1 - w2
                : w2 - w1;
        });
        return a;
    };

    // --- adjacence de la forêt courante (uniquement arêtes conservées)
    interface AdjacencyItem {
        to: string;
        edge: Edge;
    }
    const adj = new Map<string, AdjacencyItem[]>(); // nodeId -> [{to, edge}]
    const addAdj = (a: string, b: string, e: Edge): void => { if (!adj.has(a)) adj.set(a, []); adj.get(a)!.push({ to: b, edge: e }); };
    const rmAdj = (a: string, b: string, ek: string): void => { if (!adj.has(a)) return; adj.set(a, adj.get(a)!.filter(({ to, edge }: AdjacencyItem) => !(to === b && key(edge) === ek))); };
    const addForest = (e: Edge): void => { addAdj(e.data.source, e.data.target, e); addAdj(e.data.target, e.data.source, e); };
    const rmForest = (e: Edge): void => { const k = key(e); rmAdj(e.data.source, e.data.target, k); rmAdj(e.data.target, e.data.source, k); };

    // --- composantes connexes pour affichage
    const components = (): string[][] => {
        const ids = nodes.map((n: Node) => n.data.id);
        const seen = new Set<string>();
        const neigh = (x: string): string[] => (adj.get(x) || []).map((o: AdjacencyItem) => o.to);
        const out: string[][] = [];
        for (const n of ids) {
            if (seen.has(n)) continue;
            const comp: string[] = [];
            const st = [n];
            seen.add(n);
            while (st.length) {
                const x = st.pop()!;
                comp.push(x);
                for (const y of neigh(x)) if (!seen.has(y)) { seen.add(y); st.push(y); }
            }
            out.push(comp.sort());
        }
        return out.sort((A, B) => A[0].localeCompare(B[0]));
    };

    // --- chemin u→v dans la forêt courante (DFS), renvoie la liste d'ARÊTES
    const pathEdges = (u: string, v: string): Edge[] | null => {
        const stack = [[u]];
        const parent = new Map<string, { p: string | null, pe: Edge | null }>([[u, { p: null, pe: null }]]);
        while (stack.length) {
            const [x] = stack.pop()!;
            if (x === v) break;
            (adj.get(x) || []).forEach(({ to, edge }: AdjacencyItem) => {
                if (!parent.has(to)) { parent.set(to, { p: x, pe: edge }); stack.push([to]); }
            });
        }
        if (!parent.has(v)) return null;
        const path: Edge[] = [];
        let cur = v;
        while (parent.get(cur)!.p !== null) { path.push(parent.get(cur)!.pe!); cur = parent.get(cur)!.p!; }
        path.reverse();
        return path;
    };

    // ---------- état de l'algo
    const steps: ExchangeStep[] = [];
    const kept = new Set<string>();
    const discarded = new Set<string>();
    let compCount = nodes.length;
    let treeReached = false;

    const ordered = orderEdges();
    const listOrderStr = ordered.map((e: Edge) => `${e.data.source}-${e.data.target}(${e.data.weight || 0})`).join(', ');

    steps.push({
        action: 'start',
        order,
        componentCount: compCount,
        keptEdges: [],
        discardedEdges: [],
        components: nodes.map((n: any) => [n.data.id]),
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
            keptEdges: edges.filter((x: any) => kept.has(key(x))),
            discardedEdges: edges.filter((x: any) => discarded.has(key(x))),
            components: components(),
            explanation: `Sélection de l'arête ${e.data.source}-${e.data.target} (poids ${e.data.weight || 0}).`
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
                keptEdges: edges.filter((x: any) => kept.has(key(x))),
                discardedEdges: edges.filter((x: any) => discarded.has(key(x))),
                components: components(),
                explanation: `Aucun cycle créé : on réduit à ${compCount} composantes, l'arête est conservée.`
            });

            // on note la première fois où on atteint un arbre, mais on CONTINUE
            if (!treeReached && kept.size === nodes.length - 1) {
                treeReached = true;
                steps.push({
                    action: 'tree-reached',
                    componentCount: compCount,
                    keptEdges: edges.filter((x: any) => kept.has(key(x))),
                    discardedEdges: edges.filter((x: any) => discarded.has(key(x))),
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
                keptEdges: edges.filter((x: any) => kept.has(key(x))),
                discardedEdges: edges.filter((x: any) => discarded.has(key(x))),
                components: components(),
                explanation: `Cycle créé : on cherche l'arête qui possède le poids le plus élevé.`
            });

            const maxOnPath = Math.max(...path.map((pe: Edge) => pe.data.weight || 0));

            // Politique pédagogique : si w(e) est >= au max du chemin, on rejette e (on veut "voir" l'échange/rejet).
            if ((e.data.weight || 0) >= maxOnPath) {
                discarded.add(k);
                steps.push({
                    action: 'discard',
                    edge: e,
                    componentCount: compCount,
                    keptEdges: edges.filter((x: any) => kept.has(key(x))),
                    discardedEdges: edges.filter((x: any) => discarded.has(key(x))),
                    components: components(),
                    explanation: `On retire ${e.data.source}-${e.data.target} qui est de poids ${e.data.weight || 0} (poids le plus élevé du cycle).`
                });
            } else {
                // retirer une arête maximale du chemin (la première rencontrée)
                const toRemove = path.find((pe: Edge) => (pe.data.weight || 0) === maxOnPath);
                if (toRemove) {
                    rmForest(toRemove);
                    kept.delete(key(toRemove));
                }

                addForest(e);
                kept.add(k);

                if (toRemove) {
                    steps.push({
                        action: 'exchange',
                        add: e,
                        remove: toRemove,
                        componentCount: compCount, // inchangé
                        keptEdges: edges.filter((x: Edge) => kept.has(key(x))),
                        discardedEdges: edges.filter((x: Edge) => discarded.has(key(x))),
                        components: components(),
                        explanation: `On retire ${toRemove.data.source}-${toRemove.data.target} (poids ${toRemove.data.weight || 0}) — plus lourd du cycle — et on conserve ${e.data.source}-${e.data.target}.`
                    });
                }
            }
        }
    }

    // --- fin : toutes les arêtes ont été traitées
    if (kept.size < nodes.length - 1) {
        steps.push({
            action: 'stop',
            componentCount: compCount,
            keptEdges: edges.filter((x: any) => kept.has(key(x))),
            discardedEdges: edges.filter((x: any) => discarded.has(key(x))),
            components: components(),
            explanation: `Fin des arêtes : le graphe semble non connexe (arêtes conservées: ${kept.size}).`
        });
    }

    steps.push({
        action: 'done-processing',
        componentCount: compCount,
        keptEdges: edges.filter((x: Edge) => kept.has(key(x))),
        discardedEdges: edges.filter((x: Edge) => discarded.has(key(x))),
        components: components(),
        explanation: `Toutes les arêtes ont été traitées.`
    });

    return steps;
};