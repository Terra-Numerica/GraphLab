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

import '../../../styles/pages/ArbreCouvrant/GlobalMode.css';

const CostDisplay = memo(({ currentCost, optimalCost }) => {
    return (
        <div className="mode-cost">
            Coût: {currentCost}/{optimalCost}
        </div>
    );
});

const GraphDisplayMemo = memo(GraphDisplay);

const Try = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [graphs, setGraphs] = useState({
        petit: [],
        moyen: [],
        grand: []
    });
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
        if (showRules) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showRules]);

    const difficultyLabels = {
        petit: 'Petit',
        moyen: 'Moyen',
        grand: 'Grand'
    };

    // Trier les graphes par difficulté (basé sur le nombre de nœuds/arêtes)
    useEffect(() => {
        if (fetchedGraphs.length > 0) {
            const sortedGraphs = {
                petit: [],
                moyen: [],
                grand: []
            };

            const spanningTreeWorkshops = fetchedGraphs.filter((graph) => graph.workshopData.spanningTree.enabled);

            spanningTreeWorkshops.forEach(graph => {
                const nodeCount = graph.data.nodes.length;
                const edgeCount = graph.data.edges.length;

                if (nodeCount <= 9 && edgeCount <= 9) {
                    sortedGraphs.petit.push({
                        ...graph,
                        name: graph.name.replace("Jeu", "Graphe")
                    });
                } else if (nodeCount <= 16 && edgeCount <= 16) {
                    sortedGraphs.moyen.push({
                        ...graph,
                        name: graph.name.replace("Jeu", "Graphe")
                    });
                } else {
                    sortedGraphs.grand.push({
                        ...graph,
                        name: graph.name.replace("Jeu", "Graphe")
                    });
                }
            });

            setGraphs(sortedGraphs);
        }
    }, [fetchedGraphs]);

    // Fonction pour détecter les cycles dans le graphe sélectionné
    const detectCycle = useCallback((edges, nodes) => {
        if (edges.length === 0) return false;
        
        // Créer la liste d'adjacence
        const adjacencyList = {};
        nodes.forEach(node => {
            adjacencyList[node.data.id] = [];
        });
        
        edges.forEach(edge => {
            adjacencyList[edge.data.source].push(edge.data.target);
            adjacencyList[edge.data.target].push(edge.data.source);
        });
        
        // DFS pour détecter les cycles
        const visited = new Set();
        const recStack = new Set();
        
        const hasCycleDFS = (node, parent) => {
            visited.add(node);
            recStack.add(node);
            
            for (const neighbor of adjacencyList[node]) {
                if (!visited.has(neighbor)) {
                    if (hasCycleDFS(neighbor, node)) {
                        return true;
                    }
                } else if (neighbor !== parent && recStack.has(neighbor)) {
                    return true;
                }
            }
            
            recStack.delete(node);
            return false;
        };
        
        // Vérifier chaque composante connectée
        for (const node of nodes) {
            if (!visited.has(node.data.id)) {
                if (hasCycleDFS(node.data.id, null)) {
                    return true;
                }
            }
        }
        
        return false;
    }, []);

    // Fonction pour détecter les composantes connectées
    const findConnectedComponents = useCallback((edges, nodes) => {
        // Créer la liste d'adjacence
        const adjacencyList = {};
        nodes.forEach(node => {
            adjacencyList[node.data.id] = [];
        });
        
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
                if (!visited.has(neighbor)) {
                    dfs(neighbor, component);
                }
            }
        };
        
        // Trouver toutes les composantes connectées
        for (const node of nodes) {
            if (!visited.has(node.data.id)) {
                const component = [];
                dfs(node.data.id, component);
                components.push(component);
            }
        }
        
        return components;
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
                    if (weightType === 'predefined') {
                        // Pour les poids prédéfinis, on utilise les poids originaux du graphe
                        // Si pas de poids original, on génère un poids aléatoire
                        if (newEdge.data.originalWeight !== undefined) {
                            newEdge.data.weight = newEdge.data.originalWeight;
                        } else if (newEdge.data.weight === undefined || newEdge.data.weight === null || newEdge.data.weight === "") {
                            const randomWeight = Math.floor(Math.random() * 10) + 1;
                            newEdge.data.weight = randomWeight;
                            newEdge.data.originalWeight = randomWeight; // Sauvegarder comme poids original
                            updated = true;
                        } else {
                            // Si on a déjà un poids mais pas de poids original, le sauvegarder
                            if (newEdge.data.originalWeight === undefined) {
                                newEdge.data.originalWeight = newEdge.data.weight;
                            }
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
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...selectedGraphData,
                        data: {
                            ...selectedGraphData.data,
                            edges: edges
                        }
                    })
                });
            }
            setCurrentGraph({
                name: selectedGraphData.name,
                data: {
                    ...selectedGraphData.data,
                    edges: edges
                },
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

        const selectedEdgeIds = Array.from(selectedEdges);
        const selectedEdgesData = currentGraph.data.edges.filter(edge => selectedEdgeIds.includes(edge.data.id));
        const totalWeight = selectedEdgesData.reduce((sum, edge) => sum + edge.data.weight, 0);
        setCurrentCost(totalWeight);
        
        // Détecter les cycles
        const cycleDetected = detectCycle(selectedEdgesData, currentGraph.data.nodes);
        setHasCycle(cycleDetected);
        
        // Détecter les composantes connectées
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

        if (!isRunning) {
            reset();
            start();
        }

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
        const selectedEdgeIds = Array.from(selectedEdges);
        const selectedEdgesData = edges.filter(edge => selectedEdgeIds.includes(edge.data.id));

        if (selectedEdgesData.length !== nodeCount - 1) {
            setValidationPopup({
                type: 'error',
                title: 'Erreur',
                message: "Tu dois sélectionner exactement le nombre d'arêtes nécessaires pour couvrir tous les sommets."
            });
            return;
        }

        const adjacencyList = {};
        nodes.forEach(node => {
            adjacencyList[node.data.id] = [];
        });

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
            // Trouver les composantes connectées
            const components = findConnectedComponents(selectedEdgesData, nodes);
            
            // Créer le message détaillé
            let message = "Le graphe n'est pas connecté. ";
            if (components.length > 1) {
                message += "Il y a " + components.length + " composantes séparées :\n\n";
                
                // Séparer les composantes connectées et non connectées
                const connectedComponents = components.filter(comp => comp.length > 1);
                const disconnectedComponents = components.filter(comp => comp.length === 1);
                
                if (connectedComponents.length > 0) {
                    message += "Composantes connectées :\n";
                    connectedComponents.forEach((component) => {
                        const nodeLabels = component.map(nodeId => {
                            const node = nodes.find(n => n.data.id === nodeId);
                            return node ? node.data.label || nodeId : nodeId;
                        });
                        message += `• ${nodeLabels.join(', ')}\n`;
                    });
                }
                
                if (disconnectedComponents.length > 0) {
                    message += "\nComposantes non connectées :\n";
                    disconnectedComponents.forEach((component) => {
                        const nodeLabels = component.map(nodeId => {
                            const node = nodes.find(n => n.data.id === nodeId);
                            return node ? node.data.label || nodeId : nodeId;
                        });
                        message += `• ${nodeLabels[0]}\n`;
                    });
                }
                
                message += "\nTous les sommets doivent être connectés pour former un arbre couvrant.";
            } else {
                message += "Tous les sommets doivent être accessibles.";
            }
            
            setValidationPopup({
                type: 'error',
                title: 'Erreur',
                message: message
            });
            return;
        }

        const totalWeight = selectedEdgesData.reduce((sum, edge) => sum + edge.data.weight, 0);

        const optimalEdges = kruskalAlgorithm(nodes, edges);
        const optimalWeight = optimalEdges.reduce((sum, step) => sum + (step.edge?.data.weight || 0), 0);

        if (totalWeight === optimalWeight) {
            setValidationPopup({
                type: 'success',
                title: 'Félicitations !',
                message: `Tu as trouvé l'arbre couvrant de poids minimal avec un poids total de ${totalWeight}.`
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
        navigate(`/arbre-couvrant/kruskal/${selectedGraph}`, {
            state: {
                graph: currentGraph,
                weightType: weightType
            }
        });
    }, [currentGraph, selectedGraph, weightType, navigate]);

    const showPrimSolution = useCallback(() => {
        if (!currentGraph || !cyRef.current) return;
        navigate(`/arbre-couvrant/prim/${selectedGraph}`, {
            state: {
                graph: currentGraph,
                weightType: weightType
            }
        });
    }, [currentGraph, selectedGraph, weightType, navigate]);

    const showBoruvkaSolution = useCallback(() => {
        if (!currentGraph || !cyRef.current) return;
        navigate(`/arbre-couvrant/boruvka/${selectedGraph}`, {
            state: {
                graph: currentGraph,
                weightType: weightType
            }
        });
    }, [currentGraph, selectedGraph, weightType, navigate]);

    useEffect(() => {
        if (cyRef.current && selectedEdges.size === 0) {
            cyRef.current.edges().removeClass('selected');
        }
    }, [selectedEdges]);

    return (
        <div className="tree-mode-container">
            <button className="tree-mode-back-btn" onClick={() => navigate('/arbre-couvrant')}>&larr; Retour</button>
            <h2 className="tree-mode-title">Trouve l'arbre couvrant de poids minimal</h2>
            <div className="tree-mode-top-bar">
                <select
                    className="tree-mode-select"
                    value={selectedGraph}
                    onChange={handleGraphSelect}
                    disabled={graphsLoading}
                >
                    <option value="" disabled hidden>
                        {graphsLoading ? "Chargement des graphes..." : "Choisis un graphe"}
                    </option>
                    {Object.entries(graphs).map(([difficulty, graphList]) => (
                        graphList.length > 0 && (
                            <optgroup key={difficulty} label={difficultyLabels[difficulty]}>
                                {graphList.map((graph) => (
                                    <option key={graph._id} value={graph._id}>
                                        {graph.name}
                                    </option>
                                ))}
                            </optgroup>
                        )
                    ))}
                </select>
                <select
                    className="tree-mode-select"
                    value={weightType}
                    onChange={handleWeightTypeSelect}
                    disabled={!selectedGraph}
                >
                    <option value="" disabled hidden>Choisis le type de poids</option>
                    <option value="predefined">Poids prédéfinis</option>
                    <option value="one">Poids à 1</option>
                    <option value="random">Poids aléatoire</option>
                </select>
                {(graphsError || graphError) && <div className="tree-mode-error">{graphsError || graphError}</div>}
                {currentGraph && weightType && (
                    <div className="mode-info">
                        <CostDisplay currentCost={currentCost} optimalCost={optimalCost} />
                        <TimerDisplay time={time} formatTime={formatTime} />
                    </div>
                )}
            </div>
            {currentGraph && weightType && <div className="tree-mode-buttons-row">
                <button className="tree-mode-btn tree-mode-btn-validate" onClick={validateGraph}>Valider l'arbre couvrant</button>
                <button className="tree-mode-btn tree-mode-btn-reset" onClick={resetEdges}>Réinitialiser la sélection</button>
            </div>}
            {currentGraph && weightType && <GraphDisplayMemo graphData={currentGraph} cyRef={cyRef} onSelectEdge={handleEdgeSelect} />}
            {hasCycle && (
                <div className="tree-mode-cycle-error">
                    <span className="cycle-error-text">⚠️ Vous avez créé un cycle</span>
                </div>
            )}
            {disconnectedComponents.length > 1 && currentGraph && (
                <div className="tree-mode-components-error">
                    <div className="components-error-text">
                        {(() => {
                            const connectedComponents = disconnectedComponents.filter(comp => comp.length > 1);
                            const nonConnectedComponents = disconnectedComponents.filter(comp => comp.length === 1);
                            
                            return (
                                <div style={{ marginTop: '0.5rem' }}>
                                    {connectedComponents.length > 0 && (
                                        <div>
                                            <strong>Composantes connectées :</strong> {connectedComponents.map((component) => {
                                                const nodeLabels = component.map(nodeId => {
                                                    const node = currentGraph?.data?.nodes?.find(n => n.data.id === nodeId);
                                                    return node ? node.data.label || nodeId : nodeId;
                                                });
                                                return nodeLabels.join(', ');
                                            }).join(' | ')}
                                        </div>
                                    )}
                                    {nonConnectedComponents.length > 0 && (
                                        <div>
                                            <strong>Composantes non connectées :</strong> {nonConnectedComponents.map((component) => {
                                                const nodeLabels = component.map(nodeId => {
                                                    const node = currentGraph?.data?.nodes?.find(n => n.data.id === nodeId);
                                                    return node ? node.data.label || nodeId : nodeId;
                                                });
                                                return nodeLabels[0];
                                            }).join(', ')}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
            {currentGraph && weightType && (
                <div className="tree-mode-algos-solutions-container">
                    <span className="tree-mode-algos-solutions-title">Solutions :</span>
                    <div className="tree-mode-algos-solutions-btn-row">
                        <button
                            className="tree-mode-btn-algo tree-mode-btn-prim"
                            onClick={showPrimSolution}
                        >
                            Selon l'algorithme de Prim
                        </button>
                        <button
                            className="tree-mode-btn-algo tree-mode-btn-kruskal"
                            onClick={showKruskalSolution}
                        >
                            Selon l'algorithme de Kruskal
                        </button>
                        <button
                            className="tree-mode-btn-algo tree-mode-btn-boruvka"
                            onClick={showBoruvkaSolution}
                        >
                            Selon l'algorithme de Boruvka
                        </button>
                    </div>
                </div>
            )}
            <button className="tree-mode-rules-btn" onClick={() => setShowRules(true)}>&#9432; Voir les règles</button>
            {validationPopup && (
                <ValidationPopup
                    type={validationPopup.type}
                    title={validationPopup.title}
                    message={validationPopup.message}
                    onClose={handleClosePopup}
                />
            )}
            {showRules && (
                <RulesPopup title="Règles" onClose={() => setShowRules(false)}>
                    <h3>🎯 Objectif</h3>
                    <ul>
                        <li>Trouve l'arbre couvrant minimal du graphe en sélectionnant les arêtes appropriées.</li>
                        <li>Minimise la somme des poids des arêtes sélectionnées tout en connectant tous les sommets.</li>
                        <li>Évite la formation de cycles dans ta solution.</li>
                    </ul>

                    <h3>🛠️ Comment jouer à l'arbre couvrant</h3>
                    <ul>
                        <li>Choisis un graphe prédéfini dans le menu déroulant.</li>
                        <li>Sélectionne le type de poids des arêtes : prédéfini, tous à 1 ou aléatoire.</li>
                        <li>Clique sur les arêtes pour les sélectionner ou les désélectionner.</li>
                        <li>Vérifie que ta solution connecte tous les sommets sans former de cycle.</li>
                        <li>Valide ta solution pour vérifier si elle est optimale.</li>
                    </ul>

                    <h3>🔧 Fonctionnalités</h3>
                    <ul>
                        <li>Tu peux voir en temps réel le coût total de ta solution.</li>
                        <li>Compare ta solution avec les solutions optimales des algorithmes classiques.</li>
                        <li>Tu peux réinitialiser ta solution à tout moment.</li>
                        <li>Le temps écoulé est affiché pour suivre ta progression.</li>
                    </ul>
                </RulesPopup>
            )}
        </div>
    );


    function handleClosePopup() {
        setValidationPopup(null);
    }
};

export default Try;