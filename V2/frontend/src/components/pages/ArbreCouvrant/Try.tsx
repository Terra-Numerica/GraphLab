import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { kruskalAlgorithm } from '../../../utils/kruskalUtils';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTimer } from '../../../hooks/useTimer';
import { useFetchGraphs, useFetchGraph } from '../../../hooks/useFetchGraphs';
import { Graph, Node, Edge } from '../../../types';

import ValidationPopup from '../../common/ValidationPopup';
import TimerDisplay from '../../common/TimerDisplay';
import RulesPopup from '../../common/RulesPopup';
import GraphDisplay from './GraphDisplay';
import config from '../../../config';

import '../../../styles/pages/ArbreCouvrant/ArbreCouvrantStyles.css';

const CostDisplay = memo(({ currentCost, optimalCost }: { currentCost: number; optimalCost: number }) => {
    return (
        <div className="workshop-cost">
            Coût: {currentCost}/{optimalCost}
        </div>
    );
});

const GraphDisplayMemo = memo(GraphDisplay);

const Try: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [graphs, setGraphs] = useState<{
        petit: Graph[];
        moyen: Graph[];
        grand: Graph[];
    }>({
        petit: [],
        moyen: [],
        grand: []
    });
    const [selectedGraph, setSelectedGraph] = useState(location.state?.selectedGraph || '');
    const [currentGraph, setCurrentGraph] = useState<Graph | null>(null);
    const [validationPopup, setValidationPopup] = useState<{
        type: 'warning' | 'error' | 'success';
        title: string;
        message: string;
    } | null>(null);
    const [weightType, setWeightType] = useState(location.state?.weightType || '');
    const [selectedEdges, setSelectedEdges] = useState(new Set<string>());
    const [currentCost, setCurrentCost] = useState<number>(0);
    const [optimalCost, setOptimalCost] = useState<number>(0);
    const [hasCycle, setHasCycle] = useState<boolean>(false);
    const [disconnectedComponents, setDisconnectedComponents] = useState<string[][]>([]);
    const cyRef = useRef<cytoscape.Core | null>(null);
    const [showRules, setShowRules] = useState<boolean>(false);
    const { time, start, stop, reset, formatTime, isRunning } = useTimer();

    const { graphs: fetchedGraphs, loading: graphsLoading, error: graphsError } = useFetchGraphs();
    const { graph: selectedGraphData } = useFetchGraph({ id: selectedGraph });

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
            const sortedGraphs: {
                petit: Graph[];
                moyen: Graph[];
                grand: Graph[];
            } = {
                petit: [],
                moyen: [],
                grand: []
            };

            const spanningTreeWorkshops = fetchedGraphs.filter((graph) => graph.workshopData.spanningTree?.enabled);

            spanningTreeWorkshops.forEach((graph: Graph) => {
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
    const detectCycle = useCallback((edges: Edge[], nodes: Node[]) => {
        if (edges.length === 0) return false;
        
        // Créer la liste d'adjacence
        const adjacencyList: Record<string, string[]> = {};
        nodes.forEach((node: Node) => {
            adjacencyList[node.data.id] = [];
        });
        
        edges.forEach((edge: Edge) => {
            adjacencyList[edge.data.source].push(edge.data.target);
            adjacencyList[edge.data.target].push(edge.data.source);
        });
        
        // DFS pour détecter les cycles
        const visited = new Set<string>();
        const recStack = new Set<string>();
        
        const hasCycleDFS = (node: string, parent: string | null): boolean => {
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
    const findConnectedComponents = useCallback((edges: Edge[], nodes: Node[]) => {
        // Créer la liste d'adjacence
        const adjacencyList: Record<string, string[]> = {};
        nodes.forEach((node: Node) => {
            adjacencyList[node.data.id] = [];
        });
        
        edges.forEach((edge: Edge) => {
            adjacencyList[edge.data.source].push(edge.data.target);
            adjacencyList[edge.data.target].push(edge.data.source);
        });
        
        const visited = new Set<string>();
        const components: string[][] = [];
        
        const dfs = (node: string, component: string[]): void => {
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
                const component: string[] = [];
                dfs(node.data.id, component);
                components.push(component);
            }
        }
        
        return components;
    }, []);

    // Fonction pour formater les composantes selon le nouveau format
    const formatComponents = useCallback((components: string[][], nodes: Node[]) => {
        if (components.length === 0) return '';
        
        // Trier les composantes : d'abord les composantes connectées (taille > 1), puis les isolées (taille = 1)
        const sortedComponents = [...components].sort((a, b) => {
            if (a.length > 1 && b.length === 1) return -1; // Composantes connectées en premier
            if (a.length === 1 && b.length > 1) return 1;  // Composantes isolées en dernier
            return a.length - b.length; // Sinon trier par taille
        });
        
        // Convertir chaque composante en format (N1, N2, ...)
        const formattedComponents = sortedComponents.map((component: string[]) => {
            const nodeLabels = component.map((nodeId: string) => {
                const node = nodes.find((n: Node) => n.data.id === nodeId);
                return node ? node.data.label || nodeId : nodeId;
            });
            return `(${nodeLabels.join(', ')})`;
        });
        
        return formattedComponents.join(' ~ ');
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

            edges = edges.map((edge: Edge) => {
                const newEdge = { ...edge };
                if (newEdge.data) {
                    newEdge.data.controlPointDistance = newEdge.data.controlPointDistance ?? 0;
                    
                    // Sauvegarder le poids original seulement lors du premier chargement du graphe
                    const edgeData = newEdge.data as Edge['data'] & { originalWeight?: number };
                    if (edgeData.originalWeight === undefined && edgeData.weight !== undefined) {
                        edgeData.originalWeight = edgeData.weight;
                    }
                    
                    if (weightType === 'predefined') {
                        // Pour les poids prédéfinis, on utilise les poids originaux du graphe
                        if (edgeData.originalWeight !== undefined) {
                            edgeData.weight = edgeData.originalWeight;
                        } else {
                            // Si pas de poids original, on génère un poids aléatoire
                            const randomWeight = Math.floor(Math.random() * 10) + 1;
                            edgeData.weight = randomWeight;
                            edgeData.originalWeight = randomWeight;
                            updated = true;
                        }
                    } else if (weightType === 'one') {
                        edgeData.weight = 1;
                    } else if (weightType === 'random') {
                        edgeData.weight = Math.floor(Math.random() * 10) + 1;
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
                workshopData: selectedGraphData.workshopData
            } as Graph);
            setSelectedEdges(new Set());
            setDisconnectedComponents([]);
            reset();
            start();
        }
    }, [selectedGraph, weightType, selectedGraphData]);

    const handleGraphSelect = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const graphId = event.target.value;
        setSelectedGraph(graphId);
        setCurrentGraph(null);
        reset();
    }, [reset]);

    const handleWeightTypeSelect = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setWeightType(event.target.value);
    }, []);

    const handleEdgeSelect = useCallback((edge: cytoscape.EdgeSingular) => {
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
        const selectedEdgesData = currentGraph.data.edges.filter((edge: Edge) => selectedEdgeIds.includes(edge.data.id));
        const totalWeight = selectedEdgesData.reduce((sum: number, edge: Edge) => sum + (edge.data.weight || 0), 0);
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
        const optimalWeight = optimalEdges.reduce((sum: number, step) => sum + (step.edge?.data.weight || 0), 0);
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
        const selectedEdgesData = edges.filter((edge: Edge) => selectedEdgeIds.includes(edge.data.id));

        if (selectedEdgesData.length !== nodeCount - 1) {
            setValidationPopup({
                type: 'error',
                title: 'Erreur',
                message: "Tu dois sélectionner exactement le nombre d'arêtes nécessaires pour couvrir toutes les composantes."
            });
            return;
        }

        const adjacencyList: Record<string, string[]> = {};
        nodes.forEach((node: Node) => {
            adjacencyList[node.data.id] = [];
        });

        selectedEdgesData.forEach((edge: Edge) => {
            adjacencyList[edge.data.source].push(edge.data.target);
            adjacencyList[edge.data.target].push(edge.data.source);
        });

        const visited = new Set<string>();
        const queue = [nodes[0].data.id];
        visited.add(nodes[0].data.id);

        while (queue.length > 0) {
            const current = queue.shift() as string;
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
                message += formatComponents(components, nodes);
                message += "\n\nToutes les composantes doivent être connectées pour former un arbre couvrant.";
            } else {
                message += "Toutes les composantes doivent être accessibles.";
            }
            
            setValidationPopup({
                type: 'error',
                title: 'Erreur',
                message: message
            });
            return;
        }

        const totalWeight = selectedEdgesData.reduce((sum: number, edge: Edge) => sum + (edge.data.weight || 0), 0);

        const optimalEdges = kruskalAlgorithm(nodes, edges);
        const optimalWeight = optimalEdges.reduce((sum: number, step) => sum + (step.edge?.data.weight || 0), 0);

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

    const showExchangePropertySolution = useCallback(() => {
        if (!currentGraph || !cyRef.current) return;
        navigate(`/arbre-couvrant/exchange-property/${selectedGraph}`, {
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
        <div className="arbre-couvrant-container">
            <button className="workshop-back-btn" onClick={() => navigate('/arbre-couvrant')}>&larr; Retour</button>
            <h2 className="workshop-title">Trouve l'arbre couvrant de poids minimal</h2>
            <div className="workshop-top-bar">
                <select
                    className="arbre-couvrant-select"
                    value={selectedGraph}
                    onChange={handleGraphSelect}
                    disabled={graphsLoading}
                >
                    <option value="" disabled hidden>
                        {graphsLoading ? "Chargement des graphes..." : "Choisis un graphe"}
                    </option>
                    {Object.entries(graphs).map(([difficulty, graphList]) => (
                        graphList.length > 0 && (
                            <optgroup key={difficulty} label={difficultyLabels[difficulty as keyof typeof difficultyLabels]}>
                                {graphList.map((graph: Graph) => (
                                    <option key={graph._id} value={graph._id}>
                                        {graph.name}
                                    </option>
                                ))}
                            </optgroup>
                        )
                    ))}
                </select>
                <select
                    className="arbre-couvrant-select"
                    value={weightType}
                    onChange={handleWeightTypeSelect}
                    disabled={!selectedGraph}
                >
                    <option value="" disabled hidden>Choisis le type de poids</option>
                    <option value="predefined">Poids prédéfinis</option>
                    <option value="one">Poids à 1</option>
                    <option value="random">Poids aléatoire</option>
                </select>
                {graphsError && <div className="workshop-error-message">{graphsError}</div>}
                {currentGraph && weightType && (
                    <>
                        <CostDisplay currentCost={currentCost} optimalCost={optimalCost} />
                        <TimerDisplay time={time} formatTime={formatTime} />
                    </>
                )}
            </div>
            {disconnectedComponents.length > 0 && currentGraph && (
                <div className="arbre-couvrant-components-error">
                    <div className="arbre-couvrant-components-error-text">
                        <div style={{ marginTop: '0.5rem' }}>
                            <strong>Composantes :</strong> {formatComponents(disconnectedComponents, currentGraph.data.nodes)}
                        </div>
                    </div>
                </div>
            )}
            {currentGraph && weightType && <div className="workshop-buttons-row">
                <button className="workshop-btn workshop-btn-validate" onClick={validateGraph}>Valider l'arbre couvrant</button>
                <button className="workshop-btn workshop-btn-reset" onClick={resetEdges}>Réinitialiser la sélection</button>
            </div>}
            {currentGraph && weightType && <GraphDisplayMemo graphData={currentGraph} cyRef={cyRef} onSelectEdge={handleEdgeSelect} />}
            {hasCycle && (
                <div className="arbre-couvrant-cycle-error">
                    <span className="arbre-couvrant-cycle-error-text">⚠️ Vous avez créé un cycle</span>
                </div>
            )}

            {currentGraph && weightType && (
                <div className="arbre-couvrant-algos-solutions-container">
                    <span className="arbre-couvrant-algos-solutions-title">Solutions :</span>
                    <div className="arbre-couvrant-algos-solutions-btn-row">
                        <button
                            className="arbre-couvrant-btn-algo arbre-couvrant-btn-prim"
                            onClick={showPrimSolution}
                        >
                            Selon l'algorithme de Prim
                        </button>
                        <button
                            className="arbre-couvrant-btn-algo arbre-couvrant-btn-kruskal"
                            onClick={showKruskalSolution}
                        >
                            Selon l'algorithme de Kruskal
                        </button>
                        <button
                            className="arbre-couvrant-btn-algo arbre-couvrant-btn-boruvka"
                            onClick={showBoruvkaSolution}
                        >
                            Selon l'algorithme de Boruvka
                        </button>
                        <button
                            className="arbre-couvrant-btn-algo arbre-couvrant-btn-exchange"
                            onClick={showExchangePropertySolution}
                        >
                            Selon l'algorithme de la propriété d'échange
                        </button>
                    </div>
                </div>
            )}
            <button className="workshop-rules-btn" onClick={() => setShowRules(true)}>&#9432; Voir les règles</button>
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
                        <li>Minimise la somme des poids des arêtes sélectionnées tout en connectant toutes les composantes.</li>
                        <li>Évite la formation de cycles dans ta solution.</li>
                    </ul>

                    <h3>🛠️ Comment jouer à l'arbre couvrant</h3>
                    <ul>
                        <li>Choisis un graphe prédéfini dans le menu déroulant.</li>
                        <li>Sélectionne le type de poids des arêtes : prédéfini, tous à 1 ou aléatoire.</li>
                        <li>Clique sur les arêtes pour les sélectionner ou les désélectionner.</li>
                        <li>Vérifie que ta solution connecte toutes les composantes sans former de cycle.</li>
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