import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GraphDisplay from './GraphDisplay';
import ValidationPopup from '../../common/ValidationPopup';
import RulesPopup from '../../common/RulesPopup';
import '../../../styles/pages/Coloration/GlobalMode.css';
import { rgbToHex } from '../../../utils/colorUtils';

const Libre = () => {
    const [graphs, setGraphs] = useState({
        tresFacile: [],
        facile: [],
        moyen: [],
        difficile: [],
        extreme: []
    });
    const [selectedGraph, setSelectedGraph] = useState('');
    const [currentGraph, setCurrentGraph] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationPopup, setValidationPopup] = useState(null);
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
        tresFacile: 'Très Facile',
        facile: 'Facile',
        moyen: 'Moyen',
        difficile: 'Difficile',
        extreme: 'Extrême'
    };

    return (
        <div className="mode-container">
            <button className="mode-back-btn" onClick={() => navigate('/coloration')}>&larr; Retour</button>
            <h2 className="mode-title">Mode Libre</h2>
            <div className="mode-top-bar">
                <select
                    className="mode-select"
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
                {error && <div className="error-message">{error}</div>}
                {currentGraph && <div className="mode-timer">Temps: {formatTime(time)}</div>}
            </div>
            {currentGraph && <div className="mode-buttons-row">
                <button className="mode-btn mode-btn-validate" onClick={validateGraph}>Valider la coloration</button>
                <button className="mode-btn mode-btn-reset" onClick={resetColors}>Réinitialiser la coloration</button>
            </div>}
            {currentGraph && <GraphDisplay graphData={currentGraph} cyRef={cyRef} modeLibre={true} />}
            <button className="mode-rules-btn" onClick={() => setShowRules(true)}>&#9432; Voir les règles</button>
            {validationPopup && (
                <ValidationPopup
                    type={validationPopup.type}
                    title={validationPopup.title}
                    message={validationPopup.message}
                    onClose={handleClosePopup}
                />
            )}
            {showRules && (
                <RulesPopup title="Règles du mode Libre" onClose={() => setShowRules(false)}>
                    <h3>🎯 Objectif</h3>
                    <ul>
                        <li>Deux sommets adjacents ne doivent jamais avoir la même couleur.</li>
                        <li>Vous possédez un nombre limité de pastilles que vous devez placer correctement.</li>
                    </ul>

                    <h3>🛠️ Comment jouer à la <strong>Coloration d'un Graphe</strong></h3>
                    <ul>
                        <li>Sélectionnez un graphe prédéfini dans le menu déroulant.</li>
                        <li>Attrapez une pastille de couleur, faites-la glisser vers un sommet et relâchez-la pour lui attribuer cette couleur.</li>
                        <li>Coloriez entièrement le graphe en respectant les règles de coloration.</li>
                        <li>Quand vous pensez avoir réussi, cliquez sur le bouton <strong>Valider la Coloration</strong> pour vérifier si le graphe est correctement coloré.</li>
                        <li>Mettez-vous au défi d'utiliser le moins de couleurs possible pour colorer le graphe !</li>
                    </ul>

                    <h3>🔧 Fonctionnalités</h3>
                    <ul>
                        <li>Si vous pensez avoir fait une erreur, vous pouvez faire un clic droit sur un sommet pour lui retirer sa couleur.</li>
                        <li>Si vous voulez recommencer, cliquez sur <strong>Réinitialiser la Coloration</strong> pour remettre tous les sommets dans leur état initial.</li>
                    </ul>
                </RulesPopup>
            )}
        </div>
    );

    function fetchGraphs() {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/graph');
                if (!response.ok) {
                    throw new Error('Impossible de récupérer la liste des graphes');
                }
                const data = await response.json();
                const sortedGraphs = {
                    tresFacile: [],
                    facile: [],
                    moyen: [],
                    difficile: [],
                    extreme: []
                };
                data.forEach(graph => {
                    switch (graph.difficulty) {
                        case 'Très facile':
                            sortedGraphs.tresFacile.push(graph);
                            break;
                        case 'Facile':
                            sortedGraphs.facile.push(graph);
                            break;
                        case 'Moyen':
                            sortedGraphs.moyen.push(graph);
                            break;
                        case 'Difficile':
                            sortedGraphs.difficile.push(graph);
                            break;
                        case 'Extrême':
                            sortedGraphs.extreme.push(graph);
                            break;
                        default:
                            sortedGraphs.facile.push(graph);
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

    function handleGraphSelect(event) {
        const graphId = event.target.value;
        setSelectedGraph(graphId);
        if (!graphId) {
            setCurrentGraph(null);
            reset();
            return;
        }
        const fetchGraph = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/graph/${graphId}`);
                if (!response.ok) {
                    throw new Error('Impossible de récupérer les détails du graphe');
                }
                const graphConfig = await response.json();
                if (graphConfig?.data) {
                    graphConfig.data.nodes.forEach(node => {
                        if (node.position) {
                            node.position.y += 80;
                        }
                    });
                    graphConfig.data.edges.forEach(edge => {
                        if (edge.data) {
                            edge.data.controlPointDistance = edge.data.controlPointDistance ?? 0;
                        }
                    });
                    setCurrentGraph({
                        name: graphConfig.name,
                        data: graphConfig.data,
                        optimalColoring: graphConfig.optimalColoring,
                        pastilleCounts: graphConfig.pastilleCounts,
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
    }

    function validateGraph() {

        if (!cyRef.current) return;

        const defaultColor = '#CCCCCC';
        let isCompleted = true;
        let isValid = true;
        const usedColors = new Set();

        cyRef.current.nodes().forEach((node) => {

            if (node.data('isColorNode')) return;

            const nodeColor = node.style('background-color');
            let hexNodeColor = '';

            if (nodeColor.startsWith('rgb')) {
                hexNodeColor = rgbToHex(nodeColor);
            }

            if (hexNodeColor === defaultColor) {
                isCompleted = false;
            } else {
                usedColors.add(hexNodeColor);
            }

            node.connectedEdges().forEach((edge) => {
                const neighbor = edge.source().id() === node.id() ? edge.target() : edge.source();
                if (!neighbor.data('isColorNode') && neighbor.style('background-color') === nodeColor) {
                    isValid = false;
                }
            });
        });

        const optimalColorCount = currentGraph.optimalColoring;

        if (!isCompleted) {
            setValidationPopup({
                type: 'warning',
                title: 'Attention !',
                message: "Le graphe n'est pas entièrement coloré."
            });
        } else if (!isValid) {
            setValidationPopup({
                type: 'error',
                title: 'Erreur !',
                message: 'Deux sommets adjacents ont la même couleur.'
            });
        } else {
            if (usedColors.size > optimalColorCount) {
                setValidationPopup({
                    type: 'success',
                    title: 'Félicitations !',
                    message: `Vous avez réussi à colorer le graphe ! Il existe une solution qui utilise moins de couleurs. Allez-vous réussir à la trouver ?`
                });
            } else {
                stop();
                setValidationPopup({
                    type: 'success',
                    title: 'Félicitations !',
                    message: `Vous avez réussi à colorer le graphe en ${formatTime(time)} ! Vous avez trouvé la solution qui utilise le nombre minimum de couleurs !`
                });
            }
        }
    }

    function resetColors() {
        if (!cyRef.current) return;
        const defaultColor = '#CCCCCC';
        cyRef.current.nodes().forEach((node) => {
            if (!node.data('isColorNode')) {
                node.style('background-color', defaultColor);
            }
        });

        if (!isRunning) {
            reset();
            start();
        }
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

export default Libre; 