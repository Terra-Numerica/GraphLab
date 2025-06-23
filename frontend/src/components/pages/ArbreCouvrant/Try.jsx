import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { kruskalAlgorithm } from '../../../utils/kruskalUtils';
import { useNavigate, useLocation } from 'react-router-dom';

import ValidationPopup from '../../common/ValidationPopup';
import RulesPopup from '../../common/RulesPopup';
import GraphDisplay from './GraphDisplay';
import config from '../../../config';

import '../../../styles/pages/ArbreCouvrant/GlobalMode.css';

const TimerDisplay = memo(({ time, formatTime }) => {
    return <div className="mode-timer">Temps: {formatTime(time)}</div>;
});

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationPopup, setValidationPopup] = useState(null);
    const [weightType, setWeightType] = useState(location.state?.weightType || '');
    const [selectedEdges, setSelectedEdges] = useState(new Set());
    const [currentCost, setCurrentCost] = useState(0);
    const [optimalCost, setOptimalCost] = useState(0);
    const cyRef = useRef(null);
    const [showRules, setShowRules] = useState(false);
    const { time, start, stop, reset, formatTime, isRunning } = useTimer();

    useEffect(() => {
        fetchGraphs();
    }, []);

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

    useEffect(() => {
        if (!selectedGraph || !weightType) {
            setCurrentGraph(null);
            setSelectedEdges(new Set());
            return;
        }
        const fetchGraph = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/graph/${selectedGraph}`);
                if (!response.ok) {
                    throw new Error('Impossible de récupérer les détails du graphe');
                }
                const graphConfig = await response.json();
                if (graphConfig?.data) {
                    let edges = [...graphConfig.data.edges];
                    let updated = false;

                    edges = edges.map((edge) => {
                        const newEdge = { ...edge };
                        if (newEdge.data) {
                            newEdge.data.controlPointDistance = newEdge.data.controlPointDistance ?? 0;
                            if (weightType === 'predefined') {
                                if (newEdge.data.weight === undefined || newEdge.data.weight === null || newEdge.data.weight === "") {
                                    newEdge.data.weight = Math.floor(Math.random() * 10) + 1;
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
                        await fetch(`${config.apiUrl}/graph/${selectedGraph}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                ...graphConfig,
                                data: {
                                    ...graphConfig.data,
                                    edges: edges
                                }
                            })
                        });
                    }
                    setCurrentGraph({
                        name: graphConfig.name,
                        data: {
                            ...graphConfig.data,
                            edges: edges
                        },
                        difficulty: graphConfig.difficulty
                    });
                    setSelectedEdges(new Set());
                    reset();
                    start();
                } else {
                    throw new Error('Données invalides pour le graphe');
                }
            } catch (err) {
                setError('Impossible de charger le graphe sélectionné');
                setCurrentGraph(null);
                setSelectedEdges(new Set());
            }
        };
        fetchGraph();
    }, [selectedGraph, weightType]);

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
    }, [selectedEdges, currentGraph]);

    useEffect(() => {
        if (!currentGraph) return;

        const optimalEdges = kruskalAlgorithm(currentGraph.data.nodes, currentGraph.data.edges);
        const optimalWeight = optimalEdges.reduce((sum, step) => sum + (step.edge?.data.weight || 0), 0);
        setOptimalCost(optimalWeight);
    }, [currentGraph, kruskalAlgorithm]);

    const resetEdges = useCallback(() => {
        if (!cyRef.current) return;
        cyRef.current.edges().removeClass('selected');

        if (!isRunning) {
            reset();
            start();
        }

        setSelectedEdges(new Set());
        setCurrentCost(0);
    }, []);

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
            setValidationPopup({
                type: 'error',
                title: 'Erreur',
                message: "Le graphe n'est pas connecté. Tous les sommets doivent être accessibles."
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
                    disabled={loading}
                >
                    <option value="" disabled hidden>
                        {loading ? "Chargement des graphes..." : "Choisis un graphe"}
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
                {error && <div className="tree-mode-error">{error}</div>}
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

    function fetchGraphs() {
        const fetchData = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/graph`);
                if (!response.ok) {
                    throw new Error('Impossible de récupérer la liste des graphes');
                }
                const data = await response.json();
                const sortedGraphs = {
                    petit: [],
                    moyen: [],
                    grand: []
                };
                data.forEach(graph => {

                    graph = {
                        ...graph,
                        name: graph.name.replace("Jeu", "Graphe")
                    }

                    const nodeCount = graph.data.nodes.length;
                    const edgeCount = graph.data.edges.length;

                    if (nodeCount <= 9 && edgeCount <= 9) {
                        sortedGraphs.petit.push(graph);
                    } else if (nodeCount <= 16 && edgeCount <= 16) {
                        sortedGraphs.moyen.push(graph);
                    } else {
                        sortedGraphs.grand.push(graph);
                    }
                });
                setGraphs(sortedGraphs);
                setLoading(false);
            } catch (err) {
                setError('Impossible de récupérer la liste des graphes');
                setLoading(false);
            }
        };
        fetchData();
    }

    function handleClosePopup() {
        setValidationPopup(null);
    }
};

const useTimer = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    const start = () => setIsRunning(true);
    const stop = () => setIsRunning(false);
    const reset = () => {
        setTime(0);
        setIsRunning(false);
    };
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return { time, isRunning, start, stop, reset, formatTime };
};

export default Try;