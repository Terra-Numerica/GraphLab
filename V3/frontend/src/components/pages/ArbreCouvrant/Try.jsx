import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { kruskalAlgorithm } from '../../../utils/kruskalUtils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTimer } from '../../../hooks/useTimer';
import { useFetchGraphs, useFetchGraph } from '../../../hooks/useFetchGraphs';

import ValidationPopup from '../../common/ValidationPopup';
import TimerDisplay from '../../common/TimerDisplay';
import RulesPopup from '../../common/RulesPopup';
import GraphDisplay from './GraphDisplay';
import config from '../../../config';

// ❌ supprimé : import '../../../styles/pages/ArbreCouvrant/ArbreCouvrantStyles.css';

const CostDisplay = memo(({ currentCost, optimalCost }) => {
    return (
        <div className="text-xl font-semibold text-gray-700 ml-auto bg-gray-50 py-3 px-4 rounded-lg shadow-sm">
            Coût&nbsp;: {currentCost}/{optimalCost}
        </div>
    );
});

const GraphDisplayMemo = memo(GraphDisplay);

const Try = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [graphs, setGraphs] = useState({ petit: [], moyen: [], grand: [] });
    const [selectedGraph, setSelectedGraph] = useState(location.state?.selectedGraph || '');
    const [currentGraph, setCurrentGraph] = useState(null);
    const [validationPopup, setValidationPopup] = useState(null);
    const [weightType, setWeightType] = useState(location.state?.weightType || '');
    const [selectedEdges, setSelectedEdges] = useState(new Set());
    const [currentCost, setCurrentCost] = useState(0);
    const [optimalCost, setOptimalCost] = useState(0);
    const [hasCycle, setHasCycle] = useState(false);
    const [disconnectedComponents, setDisconnectedComponents] = useState([]);
    const cyRef = useRef(null);
    const [showRules, setShowRules] = useState(false);
    const { time, start, stop, reset, formatTime, isRunning } = useTimer();

    const { graphs: fetchedGraphs, loading: graphsLoading, error: graphsError } = useFetchGraphs();
    const { graph: selectedGraphData, loading: graphLoading, error: graphError } = useFetchGraph({ id: selectedGraph });

    useEffect(() => {
        document.body.style.overflow = showRules ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showRules]);

    const difficultyLabels = { petit: 'Petit', moyen: 'Moyen', grand: 'Grand' };

    useEffect(() => {
        if (fetchedGraphs.length > 0) {
            const sortedGraphs = { petit: [], moyen: [], grand: [] };
            const spanningTreeWorkshops = fetchedGraphs.filter((graph) => graph.workshopData.spanningTree.enabled);

            spanningTreeWorkshops.forEach(graph => {
                const nodeCount = graph.data.nodes.length;
                const edgeCount = graph.data.edges.length;

                if (nodeCount <= 9 && edgeCount <= 9) {
                    sortedGraphs.petit.push({ ...graph, name: graph.name.replace("Jeu", "Graphe") });
                } else if (nodeCount <= 16 && edgeCount <= 16) {
                    sortedGraphs.moyen.push({ ...graph, name: graph.name.replace("Jeu", "Graphe") });
                } else {
                    sortedGraphs.grand.push({ ...graph, name: graph.name.replace("Jeu", "Graphe") });
                }
            });

            setGraphs(sortedGraphs);
        }
    }, [fetchedGraphs]);

    const detectCycle = useCallback((edges, nodes) => {
        if (edges.length === 0) return false;
        const adjacencyList = {};
        nodes.forEach(node => { adjacencyList[node.data.id] = []; });
        edges.forEach(edge => {
            adjacencyList[edge.data.source].push(edge.data.target);
            adjacencyList[edge.data.target].push(edge.data.source);
        });
        const visited = new Set();
        const recStack = new Set();
        const hasCycleDFS = (node, parent) => {
            visited.add(node);
            recStack.add(node);
            for (const neighbor of adjacencyList[node]) {
                if (!visited.has(neighbor)) {
                    if (hasCycleDFS(neighbor, node)) return true;
                } else if (neighbor !== parent && recStack.has(neighbor)) {
                    return true;
                }
            }
            recStack.delete(node);
            return false;
        };
        for (const node of nodes) {
            if (!visited.has(node.data.id)) {
                if (hasCycleDFS(node.data.id, null)) return true;
            }
        }
        return false;
    }, []);

    const findConnectedComponents = useCallback((edges, nodes) => {
        const adjacencyList = {};
        nodes.forEach(node => { adjacencyList[node.data.id] = []; });
        edges.forEach(edge => {
            adjacencyList[edge.data.source].push(edge.data.target);
            adjacencyList[edge.data.target].push(edge.data.source);
        });
        const visited = new Set();
        const components = [];
        const dfs = (node, component) => {
            visited.add(node);
            component.push(node);
            for (const neighbor of adjacencyList[node]) {
                if (!visited.has(neighbor)) dfs(neighbor, component);
            }
        };
        for (const node of nodes) {
            if (!visited.has(node.data.id)) {
                const component = [];
                dfs(node.data.id, component);
                components.push(component);
            }
        }
        return components;
    }, []);

    const formatComponents = useCallback((components, nodes) => {
        if (components.length === 0) return '';
        const sorted = [...components].sort((a, b) => {
            if (a.length > 1 && b.length === 1) return -1;
            if (a.length === 1 && b.length > 1) return 1;
            return a.length - b.length;
        });
        const pieces = sorted.map(component => {
            const labels = component.map(id => {
                const node = nodes.find(n => n.data.id === id);
                return node ? (node.data.label || id) : id;
            });
            return `(${labels.join(', ')})`;
        });
        return pieces.join(' ~ ');
    }, []);

    useEffect(() => {
        if (!selectedGraph || !weightType || !selectedGraphData) {
            setCurrentGraph(null);
            setSelectedEdges(new Set());
            return;
        }
        if (selectedGraphData?.data) {
            let edges = [...selectedGraphData.data.edges];
            let updated = false;

            edges = edges.map((edge) => {
                const newEdge = { ...edge };
                if (newEdge.data) {
                    newEdge.data.controlPointDistance = newEdge.data.controlPointDistance ?? 0;
                    if (newEdge.data.originalWeight === undefined && newEdge.data.weight !== undefined) {
                        newEdge.data.originalWeight = newEdge.data.weight;
                    }
                    if (weightType === 'predefined') {
                        if (newEdge.data.originalWeight !== undefined) {
                            newEdge.data.weight = newEdge.data.originalWeight;
                        } else {
                            const randomWeight = Math.floor(Math.random() * 10) + 1;
                            newEdge.data.weight = randomWeight;
                            newEdge.data.originalWeight = randomWeight;
                            updated = true;
                        }
                    } else if (weightType === 'one') {
                        newEdge.data.weight = 1;
                    } else if (weightType === 'random') {
                        newEdge.data.weight = Math.floor(Math.random() * 10) + 1;
                    }
                }
                return newEdge;
            });

            if (weightType === 'predefined' && updated) {
                fetch(`${config.apiUrl}/graph/${selectedGraph}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...selectedGraphData,
                        data: { ...selectedGraphData.data, edges }
                    })
                });
            }
            setCurrentGraph({
                name: selectedGraphData.name,
                data: { ...selectedGraphData.data, edges },
                difficulty: selectedGraphData.difficulty
            });
            setSelectedEdges(new Set());
            setDisconnectedComponents([]);
            reset();
            start();
        }
    }, [selectedGraph, weightType, selectedGraphData]);

    const handleGraphSelect = useCallback((event) => {
        const graphId = event.target.value;
        setSelectedGraph(graphId);
        setCurrentGraph(null);
        reset();
    }, [reset]);

    const handleWeightTypeSelect = useCallback((event) => {
        setWeightType(event.target.value);
    }, []);

    const handleEdgeSelect = useCallback((edge) => {
        if (!cyRef.current) return;
        const edgeId = edge.id();
        setSelectedEdges(prev => {
            const newSet = new Set(prev);
            if (newSet.has(edgeId)) {
                newSet.delete(edgeId);
                edge.removeClass('selected');
            } else {
                newSet.add(edgeId);
                edge.addClass('selected');
            }
            return newSet;
        });
    }, []);

    useEffect(() => {
        if (!currentGraph) return;
        const selectedIds = Array.from(selectedEdges);
        const selectedEdgesData = currentGraph.data.edges.filter(e => selectedIds.includes(e.data.id));
        const totalWeight = selectedEdgesData.reduce((s, e) => s + e.data.weight, 0);
        setCurrentCost(totalWeight);

        const cycleDetected = detectCycle(selectedEdgesData, currentGraph.data.nodes);
        setHasCycle(cycleDetected);

        const components = findConnectedComponents(selectedEdgesData, currentGraph.data.nodes);
        setDisconnectedComponents(components);
    }, [selectedEdges, currentGraph, detectCycle, findConnectedComponents]);

    useEffect(() => {
        if (!currentGraph) return;
        const optimalEdges = kruskalAlgorithm(currentGraph.data.nodes, currentGraph.data.edges);
        const optimalWeight = optimalEdges.reduce((sum, step) => sum + (step.edge?.data.weight || 0), 0);
        setOptimalCost(optimalWeight);
    }, [currentGraph]);

    const resetEdges = useCallback(() => {
        if (!cyRef.current) return;
        cyRef.current.edges().removeClass('selected');
        if (!isRunning) { reset(); start(); }
        setSelectedEdges(new Set());
        setCurrentCost(0);
        setHasCycle(false);
        setDisconnectedComponents([]);
    }, [isRunning, reset, start]);

    const validateGraph = useCallback(() => {
        if (!currentGraph || !cyRef.current) return;

        const nodes = currentGraph.data.nodes;
        const edges = currentGraph.data.edges;
        const nodeCount = nodes.length;
        const selectedIds = Array.from(selectedEdges);
        const selectedEdgesData = edges.filter(edge => selectedIds.includes(edge.data.id));

        if (selectedEdgesData.length !== nodeCount - 1) {
            setValidationPopup({
                type: 'error',
                title: 'Erreur',
                message: "Tu dois sélectionner exactement le nombre d'arêtes nécessaires pour couvrir toutes les composantes."
            });
            return;
        }

        const adjacencyList = {};
        nodes.forEach(node => { adjacencyList[node.data.id] = []; });
        selectedEdgesData.forEach(edge => {
            adjacencyList[edge.data.source].push(edge.data.target);
            adjacencyList[edge.data.target].push(edge.data.source);
        });

        const visited = new Set();
        const queue = [nodes[0].data.id];
        visited.add(nodes[0].data.id);

        while (queue.length > 0) {
            const current = queue.shift();
            for (const neighbor of adjacencyList[current]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }

        if (visited.size !== nodeCount) {
            const components = findConnectedComponents(selectedEdgesData, nodes);
            let message = "Le graphe n'est pas connecté. ";
            if (components.length > 1) {
                message += "Il y a " + components.length + " composantes séparées :\n\n";
                message += formatComponents(components, nodes);
                message += "\n\nToutes les composantes doivent être connectées pour former un arbre couvrant.";
            } else {
                message += "Toutes les composantes doivent être accessibles.";
            }
            setValidationPopup({ type: 'error', title: 'Erreur', message });
            return;
        }

        const totalWeight = selectedEdgesData.reduce((sum, edge) => sum + edge.data.weight, 0);
        const optimalEdges = kruskalAlgorithm(nodes, edges);
        const optimalWeight = optimalEdges.reduce((sum, step) => sum + (step.edge?.data.weight || 0), 0);

        if (totalWeight === optimalWeight) {
            setValidationPopup({
                type: 'success',
                title: 'Félicitations !',
                message: `Tu as trouvé l'arbre couvrant de poids minimal en ${formatTime(time)} avec un poids total de ${totalWeight}.`
            });
            stop();
        } else {
            setValidationPopup({
                type: 'error',
                title: 'Presque !',
                message: `Le poids total de ton arbre couvrant est ${totalWeight}, mais il existe une solution de poids ${optimalWeight}.`
            });
        }
    }, [currentGraph, selectedEdges, stop]);

    const showKruskalSolution = useCallback(() => {
        if (!currentGraph || !cyRef.current) return;
        navigate(`/arbre-couvrant/kruskal/${selectedGraph}`, { state: { graph: currentGraph, weightType } });
    }, [currentGraph, selectedGraph, weightType, navigate]);

    const showPrimSolution = useCallback(() => {
        if (!currentGraph || !cyRef.current) return;
        navigate(`/arbre-couvrant/prim/${selectedGraph}`, { state: { graph: currentGraph, weightType } });
    }, [currentGraph, selectedGraph, weightType, navigate]);

    const showBoruvkaSolution = useCallback(() => {
        if (!currentGraph || !cyRef.current) return;
        navigate(`/arbre-couvrant/boruvka/${selectedGraph}`, { state: { graph: currentGraph, weightType } });
    }, [currentGraph, selectedGraph, weightType, navigate]);

    const showExchangePropertySolution = useCallback(() => {
        if (!currentGraph || !cyRef.current) return;
        navigate(`/arbre-couvrant/exchange-property/${selectedGraph}`, { state: { graph: currentGraph, weightType } });
    }, [currentGraph, selectedGraph, weightType, navigate]);

    useEffect(() => {
        if (cyRef.current && selectedEdges.size === 0) {
            cyRef.current.edges().removeClass('selected');
        }
    }, [selectedEdges]);

    return (
        <div className="w-full bg-gray-100 px-4 sm:px-8 md:px-16 py-8">
            <div className="mx-auto max-w-6xl">
                {/* Back */}
                <button
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-blue px-4 py-2 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                    onClick={() => navigate('/arbre-couvrant')}
                >
                    <span aria-hidden>←</span> Retour
                </button>

                {/* Title */}
                <h2 className="mt-4 text-center text-3xl md:text-4xl font-bold text-darkBlue">
                    Trouve l'arbre couvrant de poids minimal
                </h2>

                {/* Top bar */}
                <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow md:flex-row md:items-center md:justify-between">
                    <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                        <select
                            className="w-full rounded-xl border border-grey bg-white px-3 py-2 text-astro shadow-sm focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30 md:w-72"
                            value={selectedGraph}
                            onChange={handleGraphSelect}
                            disabled={graphsLoading}
                        >
                            <option value="" disabled hidden>
                                {graphsLoading ? "Chargement des graphes..." : "Choisis un graphe"}
                            </option>
                            {Object.entries(graphs).map(([difficulty, graphList]) =>
                                graphList.length > 0 ? (
                                    <optgroup key={difficulty} label={difficultyLabels[difficulty]}>
                                        {graphList.map((graph) => (
                                            <option key={graph._id} value={graph._id}>
                                                {graph.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ) : null
                            )}
                        </select>

                        <select
                            className="w-full rounded-xl border border-grey bg-white px-3 py-2 text-astro shadow-sm focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30 md:w-56"
                            value={weightType}
                            onChange={handleWeightTypeSelect}
                            disabled={!selectedGraph}
                        >
                            <option value="" disabled hidden>Choisis le type de poids</option>
                            <option value="predefined">Poids prédéfinis</option>
                            <option value="one">Poids à 1</option>
                            <option value="random">Poids aléatoire</option>
                        </select>
                    </div>

                    <div className="flex flex-col items-end gap-2 md:flex-row md:items-center md:gap-3">
                        {currentGraph && weightType && (
                            <>
                                <CostDisplay currentCost={currentCost} optimalCost={optimalCost} />
                                <TimerDisplay time={time} formatTime={formatTime} />
                            </>
                        )}
                    </div>
                </div>

                <div className="flex-1">
                    {graphsError && (
                        <div className="rounded-lg bg-red/10 px-3 py-2 text-sm font-medium text-red">
                            {graphsError}
                        </div>
                    )}
                    {graphError && !fetchedGraphs && (
                        <div className="rounded-lg bg-red/10 px-3 py-2 text-sm font-medium text-red">
                            {graphError}
                        </div>
                    )}
                </div>

                {/* Components error (disconnected) */}
                {disconnectedComponents.length > 0 && currentGraph && (
                    <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <div className="font-semibold">Composantes :</div>
                        <div className="mt-2">
                            {formatComponents(disconnectedComponents, currentGraph.data.nodes)}
                        </div>
                    </div>
                )}

                {/* Action buttons */}
                {currentGraph && weightType && (
                    <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-green px-5 py-2.5 text-sm font-semibold text-green hover:bg-green hover:text-white transition focus:outline-none focus:ring-2 focus:ring-green/40"
                            onClick={validateGraph}
                        >
                            Valider l'arbre couvrant
                        </button>
                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-red px-5 py-2.5 text-sm font-semibold text-red hover:bg-red hover:text-white transition focus:outline-none focus:ring-2 focus:ring-red/40"
                            onClick={resetEdges}
                        >
                            Réinitialiser la sélection
                        </button>
                    </div>
                )}

                {/* Graph card */}
                {currentGraph && weightType && (
                    <div className="mt-6 overflow-hidden rounded-2xl bg-white p-3 shadow">
                        <GraphDisplayMemo graphData={currentGraph} cyRef={cyRef} onSelectEdge={handleEdgeSelect} />
                    </div>
                )}

                {/* Cycle warning */}
                {hasCycle && (
                    <div className="mt-4 rounded-xl border border-red-300 bg-red/10 px-4 py-3 text-sm font-semibold text-red">
                        ⚠️ Vous avez créé un cycle
                    </div>
                )}

                {/* Solutions */}
                {currentGraph && weightType && (
                    <div className="mt-8 rounded-2xl bg-white p-4 shadow">
                        <span className="block text-base font-semibold text-darkBlue">Solutions :</span>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <button
                                className="inline-flex items-center justify-center rounded-xl border-2 border-blue px-5 py-2.5 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                                onClick={showPrimSolution}
                            >
                                Selon l'algorithme de Prim
                            </button>
                            <button
                                className="inline-flex items-center justify-center rounded-xl border-2 border-blue px-5 py-2.5 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                                onClick={showKruskalSolution}
                            >
                                Selon l'algorithme de Kruskal
                            </button>
                            <button
                                className="inline-flex items-center justify-center rounded-xl border-2 border-blue px-5 py-2.5 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                                onClick={showBoruvkaSolution}
                            >
                                Selon l'algorithme de Boruvka
                            </button>
                            <button
                                className="inline-flex items-center justify-center rounded-xl border-2 border-blue px-5 py-2.5 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                                onClick={showExchangePropertySolution}
                            >
                                Selon l'algorithme de la propriété d'échange
                            </button>
                        </div>
                    </div>
                )}

                {/* Floating rules */}
                <button
                    className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-green px-5 py-3 text-base font-bold text-white shadow-xl hover:bg-green-hover hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green/40 transition-all duration-200"
                    onClick={() => setShowRules(true)}
                    aria-label="Voir les règles"
                >
                    &#9432; Voir les règles
                </button>

                {/* Popups */}
                {validationPopup && (
                    <ValidationPopup
                        type={validationPopup.type}
                        title={validationPopup.title}
                        message={validationPopup.message}
                        onClose={() => setValidationPopup(null)}
                    />
                )}

                {showRules && (
                    <RulesPopup title="Règles" onClose={() => setShowRules(false)}>
                        <h3>🎯 Objectif</h3>
                        <ul className="list-disc pl-5">
                            <li>Trouve l'arbre couvrant minimal du graphe en sélectionnant les arêtes appropriées.</li>
                            <li>Minimise la somme des poids des arêtes sélectionnées tout en connectant toutes les composantes.</li>
                            <li>Évite la formation de cycles dans ta solution.</li>
                        </ul>

                        <h3 className="mt-4">🛠️ Comment jouer à l'arbre couvrant</h3>
                        <ul className="list-disc pl-5">
                            <li>Choisis un graphe prédéfini dans le menu déroulant.</li>
                            <li>Sélectionne le type de poids des arêtes : prédéfini, tous à 1 ou aléatoire.</li>
                            <li>Clique sur les arêtes pour les sélectionner ou les désélectionner.</li>
                            <li>Vérifie que ta solution connecte toutes les composantes sans former de cycle.</li>
                            <li>Valide ta solution pour vérifier si elle est optimale.</li>
                        </ul>

                        <h3 className="mt-4">🔧 Fonctionnalités</h3>
                        <ul className="list-disc pl-5">
                            <li>Tu peux voir en temps réel le coût total de ta solution.</li>
                            <li>Compare ta solution avec les solutions optimales des algorithmes classiques.</li>
                            <li>Tu peux réinitialiser ta solution à tout moment.</li>
                            <li>Le temps écoulé est affiché pour suivre ta progression.</li>
                        </ul>
                    </RulesPopup>
                )}
            </div>
        </div>
    );

    function setValidationPopupSafe(v) {
        setValidationPopup(v);
    }
};

export default Try;