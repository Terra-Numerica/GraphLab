import { colors as colorPalette } from '../../../utils/colorPalette';
import { useState, useRef, useEffect, useMemo } from 'react';
import { rgbToHex } from '../../../utils/colorUtils';
import { useNavigate } from 'react-router-dom';

import ValidationPopup from '../../common/ValidationPopup';
import RulesPopup from '../../common/RulesPopup';
import GraphDisplay from './GraphDisplay';

import '../../../styles/pages/Coloration/GlobalMode.css';

const TimerDisplay = ({ time, formatTime }) => {
    return <div className="mode-timer">Temps: {formatTime(time)}</div>;
};

const Creation = () => {
    const navigate = useNavigate();
    const cyRef = useRef(null);
    const { time, isRunning, start, stop, reset, formatTime } = useTimer();
    const [colorCount, setColorCount] = useState('');
    const [graphData, setGraphData] = useState({
        nodes: [],
        edges: []
    });
    const [validationPopup, setValidationPopup] = useState(null);
    const [showRules, setShowRules] = useState(false);
    const [isLibreMode, setIsLibreMode] = useState(false);

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

    const handleAddNode = (node) => {
        setGraphData(prev => ({
            nodes: [...prev.nodes, node],
            edges: prev.edges
        }));
    };

    const handleColorNode = (nodeId, color) => {
        setGraphData(prev => ({
            ...prev,
            nodes: prev.nodes.map(node =>
                node.data.id === nodeId
                    ? { ...node, data: { ...node.data, color } }
                    : node
            )
        }));
    };

    const handleAddEdge = (edge) => {
        setGraphData(prev => ({
            nodes: prev.nodes,
            edges: [...prev.edges, edge]
        }));
    };

    const handleDeleteNode = (nodeId) => {
        setGraphData(prev => ({
            nodes: prev.nodes.filter(node => node.data.id !== nodeId),
            edges: prev.edges.filter(edge => edge.data.source !== nodeId && edge.data.target !== nodeId)
        }));
    };

    const handleDeleteEdge = (edgeId) => {
        setGraphData(prev => ({
            nodes: prev.nodes,
            edges: prev.edges.filter(edge => edge.data.id !== edgeId)
        }));
    };

    const resetGraph = () => {
        setGraphData({ nodes: [], edges: [] });
        reset();
    };

    const rearrangeGraph = () => {
        if (cyRef.current) {
            const layoutOptions = {
                name: 'circle',
                fit: true,
                padding: 30,
                avoidOverlap: true,
            };
            cyRef.current.layout(layoutOptions).run();
        }
    };

    const handleColorCountChange = (e) => {
        const value = e.target.value;
        if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 12)) {
            setColorCount(value);
        }
    };

    const tryGraph = () => {
        if (graphData.nodes.length === 0) {
            setValidationPopup({
                type: 'warning',
                title: 'Attention !',
                message: "Tu dois créer un graphe avant de l'essayer."
            });
            return;
        }
        setIsLibreMode(true);
        reset();
        start();
    };

    const returnToEditor = () => {
        setIsLibreMode(false);
        stop();
        reset();
        setGraphData(prev => ({
            ...prev,
            nodes: prev.nodes
                .filter(node => !node.data.isColorNode)
                .map(node => ({ ...node, data: { ...node.data, color: '#CCCCCC' } }))
        }));
        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }
    };

    const resetColoration = () => {
        if (cyRef.current) {
            cyRef.current.nodes().forEach(node => {
                if (!node.data('isColorNode')) {
                    node.style('background-color', '#CCCCCC');
                }
            });
        }
        setGraphData(prev => ({
            ...prev,
            nodes: prev.nodes.map(node =>
                node.data.isColorNode
                    ? node
                    : { ...node, data: { ...node.data, color: '#CCCCCC' } }
            )
        }));
        if (!isRunning) {
            reset();
            start();
        }
    };

    const validateColoration = () => {
        if (!cyRef.current) return;
        const defaultColor = '#CCCCCC';
        let isCompleted = true;
        let isValid = true;
        const usedColors = new Set();
        const nodeColors = new Map();

        cyRef.current.nodes().forEach((node) => {
            if (!node.data('isColorNode')) {
                nodeColors.set(node.id(), node.style('background-color'));
            }
        });

        cyRef.current.nodes().forEach((node) => {
            if (node.data('isColorNode')) return;
            const nodeColor = nodeColors.get(node.id());
            let hexNodeColor = '';
            if (nodeColor.startsWith('rgb')) {
                hexNodeColor = rgbToHex(nodeColor);
            } else {
                hexNodeColor = nodeColor;
            }
            if (hexNodeColor === defaultColor) {
                isCompleted = false;
            } else {
                usedColors.add(hexNodeColor);
            }
            node.connectedEdges().forEach((edge) => {
                const neighbor = edge.source().id() === node.id() ? edge.target() : edge.source();
                if (!neighbor.data('isColorNode') && nodeColors.get(neighbor.id()) === nodeColor) {
                    isValid = false;
                }
            });
        });

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
            stop();
            setValidationPopup({
                type: 'success',
                title: 'Félicitations !',
                message: `Bravo ! La coloration est valide ! \n Temps: ${formatTime(time)}`
            });
        }
    };

    const getPastilleCounts = () => {
        let count = parseInt(colorCount);
        if (!count || count < 1 || count > colorPalette.length) count = 12;
        const pastilleCounts = {};
        for (let i = 0; i < count; i++) {
            pastilleCounts[colorPalette[i]] = Infinity;
        }
        return pastilleCounts;
    };

    const memoizedGraphData = useMemo(() => {
        if (isLibreMode) {
            return {
                nodes: graphData.nodes,
                edges: graphData.edges,
                pastilleCounts: getPastilleCounts()
            };
        }
        return graphData;
    }, [isLibreMode, graphData, colorCount]);

    const handleClosePopup = () => {
        setValidationPopup(null);
    };

    return (
        <div className="mode-container">
            <button className="mode-back-btn" onClick={() => navigate('/coloration')}>&larr; Retour</button>
            <h2 className="mode-title">Mode Création</h2>

            <div className="mode-top-bar">
                <div className="mode-color-input">
                    <label htmlFor="colorCount">Nombre de couleurs :</label>
                    <input
                        type="number"
                        id="colorCount"
                        value={colorCount}
                        onChange={handleColorCountChange}
                        min="1"
                        max="12"
                        disabled={isLibreMode}
                        placeholder="Optionnel"
                    />
                </div>
                <TimerDisplay time={time} formatTime={formatTime} />
            </div>

            {!isLibreMode ? (
                <div className="mode-buttons-row">
                    <button className="mode-btn mode-btn-add" onClick={() => {
                        if (cyRef.current) {
                            const newNodeId = `node-${graphData.nodes.length}-${Date.now()}`;
                            const newNode = {
                                group: 'nodes',
                                data: { id: newNodeId },
                                position: {
                                    x: Math.random() * 800 + 100,
                                    y: Math.random() * 400 + 100
                                },
                                locked: false
                            };
                            handleAddNode(newNode);
                        }
                    }}>
                        Ajouter un sommet
                    </button>
                    <button className="mode-btn mode-btn-reset" onClick={resetGraph}>
                        Réinitialiser le graphe
                    </button>
                    <button className="mode-btn mode-btn-rearrange" onClick={rearrangeGraph}>
                        Réarranger le graphe
                    </button>
                    <button className="mode-btn mode-btn-try" onClick={tryGraph}>
                        Essayer le graphe
                    </button>
                </div>
            ) : (
                <div className="mode-buttons-row">
                    <button className="mode-btn mode-btn-validate" onClick={validateColoration}>
                        Valider la coloration
                    </button>
                    <button className="mode-btn mode-btn-reset" onClick={resetColoration}>
                        Réinitialiser la coloration
                    </button>
                    <button className="mode-btn mode-btn-back" onClick={returnToEditor}>
                        Revenir à l'éditeur
                    </button>
                </div>
            )}

            <GraphDisplay
                graphData={memoizedGraphData}
                cyRef={cyRef}
                modeCreation={!isLibreMode}
                modeLibre={isLibreMode}
                creationLibreMode={isLibreMode}
                onAddNode={handleAddNode}
                onAddEdge={handleAddEdge}
                onDeleteNode={handleDeleteNode}
                onDeleteEdge={handleDeleteEdge}
                onColorNode={handleColorNode}
            />

            {!isLibreMode && (
                <button className="mode-rules-btn" onClick={() => setShowRules(true)}>&#9432; Voir les règles</button>
            )}

            {validationPopup && (
                <ValidationPopup
                    type={validationPopup.type}
                    title={validationPopup.title}
                    message={validationPopup.message}
                    onClose={handleClosePopup}
                />
            )}

            {showRules && (
                <RulesPopup title="Règles du mode Création" onClose={() => setShowRules(false)}>
                    <h3>🎯 Objectif</h3>
                    <ul>
                        <li>Crée un graphe et colorie-le.</li>
                        <li>Deux sommets adjacents ne doivent jamais avoir la même couleur.</li>
                        <li>Tu disposes d'un nombre limité de pastilles que tu dois placer correctement.</li>
                    </ul>

                    <h3>🛠️ Comment créer un <strong>Graphe</strong></h3>
                    <ul>
                        <li>Clique sur le bouton <strong>Ajouter un sommet</strong> pour ajouter un sommet au graphe.</li>
                        <li>Place le sommet en le faisant glisser là où tu le souhaites.</li>
                        <li>En faisant un clic gauche sur un sommet puis un autre clic gauche sur un autre sommet, tu peux ajouter une arête entre les deux sommets.</li>
                        <li>Dès que tu penses avoir terminé de créer ton graphe, clique sur le bouton <strong>Essayer le Graphe</strong> pour commencer à le colorer.</li>
                    </ul>

                    <h3>🛠️ Comment jouer à la <strong>Coloration d'un Graphe</strong></h3>
                    <ul>
                        <li>Attrape une pastille de couleur, fais-la glisser vers un sommet et relâche-la pour lui attribuer cette couleur.</li>
                        <li>Colorie entièrement le graphe en respectant les règles de coloration.</li>
                        <li>Quand tu penses avoir réussi, clique sur le bouton <strong>Valider la Coloration</strong> pour vérifier si le graphe est correctement coloré.</li>
                        <li>Mets-toi au défi d'utiliser le moins de couleurs possible pour colorer le graphe !</li>
                    </ul>

                    <h3>🔧 Fonctionnalités</h3>
                    <ul>
                        <li>Lors de la création, si tu penses que ton graphe n'est pas bien organisé, tu peux le réarranger en cliquant sur <strong>Réarranger le graphe</strong>.</li>
                        <li>Si tu penses avoir fait une erreur, tu peux faire un clic droit sur un sommet pour lui retirer sa couleur.</li>
                        <li>Si tu veux recommencer, clique sur <strong>Réinitialiser la Coloration</strong> pour remettre tous les sommets dans leur état initial.</li>
                    </ul>
                </RulesPopup>
            )}
        </div>
    );
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

export default Creation; 