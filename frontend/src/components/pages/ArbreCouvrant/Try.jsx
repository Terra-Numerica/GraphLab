import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import GraphDisplay from './GraphDisplay';
import ValidationPopup from '../../common/ValidationPopup';
import RulesPopup from '../../common/RulesPopup';
import '../../../styles/pages/ArbreCouvrant/GlobalMode.css';
import config from '../../../config';

const TimerDisplay = React.memo(({ time, formatTime }) => {
    return <div className="mode-timer">Temps: {formatTime(time)}</div>;
});

const GraphDisplayMemo = memo(GraphDisplay);

const Try = () => {

    const [graphs, setGraphs] = useState({
        petit: [],
        moyen: [],
        grand: []
    });
    const [selectedGraph, setSelectedGraph] = useState('');
    const [currentGraph, setCurrentGraph] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationPopup, setValidationPopup] = useState(null);
    const [weightType, setWeightType] = useState(''); // 'predefined', 'one', 'random'
    const cyRef = useRef(null);
    const [showRules, setShowRules] = useState(false);
    const { time, start, stop, reset, formatTime, isRunning } = useTimer();
    const navigate = useNavigate();

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

                    // Build a map of node positions
                    const nodesMap = {};
                    (graphConfig.data.nodes || []).forEach(node => {
                        nodesMap[node.data.id] = node.position;
                    });
                    // Detect crossings and set labelOffset
                    const edgeCount = edges.length;
                    const labelOffsets = new Array(edgeCount).fill(0);
                    for (let i = 0; i < edgeCount; i++) {
                        for (let j = i + 1; j < edgeCount; j++) {
                            if (edgesCross(edges[i], edges[j], nodesMap)) {
                                labelOffsets[i] = 12;
                                labelOffsets[j] = -12;
                            }
                        }
                    }
                    edges = edges.map((edge, i) => {
                        const newEdge = { ...edge };
                        if (newEdge.data) {
                            newEdge.data.controlPointDistance = newEdge.data.controlPointDistance ?? 0;
                            newEdge.data.labelOffset = labelOffsets[i];
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
                    reset();
                    start();
                } else {
                    throw new Error('Données invalides pour le graphe');
                }
            } catch (err) {
                setError('Impossible de charger le graphe sélectionné');
                setCurrentGraph(null);
            }
        };
        fetchGraph();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // TODO: Implement edge selection logic
    }, []);

    const validateGraph = useCallback(() => {
        // TODO: Implement validation logic
    }, []);

    const resetEdges = useCallback(() => {
        // TODO: Implement reset logic
    }, []);

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
                        {loading ? "Chargement des graphes..." : "Veuillez choisir un graphe"}
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
                    <option value="" disabled hidden>Veuillez choisir le type de poids</option>
                    <option value="predefined">Poids Prédéfinis</option>
                    <option value="one">Poids à 1</option>
                    <option value="random">Poids Random</option>
                </select>
                {error && <div className="tree-mode-error">{error}</div>}
                {currentGraph && weightType && <TimerDisplay time={time} formatTime={formatTime} />}
            </div>
            {currentGraph && weightType && <div className="tree-mode-buttons-row">
                <button className="tree-mode-btn tree-mode-btn-validate" onClick={validateGraph}>Valider l'arbre couvrant</button>
                <button className="tree-mode-btn tree-mode-btn-reset" onClick={resetEdges}>Réinitialiser la sélection</button>
            </div>}
            {currentGraph && weightType && <GraphDisplayMemo graphData={currentGraph} cyRef={cyRef} onSelectEdge={handleEdgeSelect} />}
            {currentGraph && weightType && (
                <div className="tree-mode-algos-solutions-container">
                    <span className="tree-mode-algos-solutions-title">Solutions selon les algorithmes :</span>
                    <div className="tree-mode-algos-solutions-btn-row">
                        <button
                            className="tree-mode-btn-algo tree-mode-btn-prim"
                            onClick={() => {/* TODO: Afficher la solution de Prim */ }}
                        >
                            Solution selon l'algorithme de Prim
                        </button>
                        <button
                            className="tree-mode-btn-algo tree-mode-btn-kruskal"
                            onClick={() => {/* TODO: Afficher la solution de Kruskal */ }}
                        >
                            Solution selon l'algorithme de Kruskal
                        </button>
                        <button
                            className="tree-mode-btn-algo tree-mode-btn-boruvka"
                            onClick={() => {/* TODO: Afficher la solution de Boruvka */ }}
                        >
                            Solution selon l'algorithme de Boruvka
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
                    </ul>

                    <h3>🛠️ Comment jouer à l'arbre couvrant</h3>
                    <ul>
                    </ul>

                    <h3>🔧 Fonctionnalités</h3>
                    <ul>
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

    // Utility: Check if two line segments (edges) cross
    function edgesCross(e1, e2, nodesMap) {
        // Get source/target positions
        const a1 = nodesMap[e1.data.source];
        const a2 = nodesMap[e1.data.target];
        const b1 = nodesMap[e2.data.source];
        const b2 = nodesMap[e2.data.target];
        if (!a1 || !a2 || !b1 || !b2) return false;
        // Exclude if they share a node
        if ([e1.data.source, e1.data.target].some(id => id === e2.data.source || id === e2.data.target)) return false;
        // Helper: orientation
        function orientation(p, q, r) {
            const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
            if (val === 0) return 0;
            return val > 0 ? 1 : 2;
        }
        // Helper: check intersection
        function doIntersect(p1, q1, p2, q2) {
            const o1 = orientation(p1, q1, p2);
            const o2 = orientation(p1, q1, q2);
            const o3 = orientation(p2, q2, p1);
            const o4 = orientation(p2, q2, q1);
            return o1 !== o2 && o3 !== o4;
        }
        return doIntersect(a1, a2, b1, b2);
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