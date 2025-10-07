// Imports
import { colors as colorPalette } from '../../../utils/colorPalette';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useTimer } from '../../../hooks/useTimer';
import { useNavigate } from 'react-router-dom';
import { Node, Edge } from '../../../types';

import ValidationPopup from '../../common/ValidationPopup';
import TimerDisplay from '../../common/TimerDisplay';
import RulesPopup from '../../common/RulesPopup';
import GraphDisplay from './GraphDisplay';

import '../../../styles/pages/Coloration/ColorationStyles.css';

const Creation: React.FC = () => {
    const navigate = useNavigate();
    const cyRef = useRef<cytoscape.Core | null>(null);
    const { time, isRunning, start, stop, reset, formatTime } = useTimer();
    const [colorCount, setColorCount] = useState('');
    const [graphData, setGraphData] = useState<{
        nodes: (Node & { data: Node['data'] & { color?: string; isColorNode?: boolean } })[];
        edges: Edge[];
    }>({
        nodes: [],
        edges: []
    });
    const [validationPopup, setValidationPopup] = useState<{
        type: 'warning' | 'error' | 'success';
        title: string;
        message: string;
    } | null>(null);
    const [showRules, setShowRules] = useState<boolean>(false);
    const [isLibreMode, setIsLibreMode] = useState<boolean>(false);

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

    const handleAddNode = (node: Node & { data: Node['data'] & { color?: string; isColorNode?: boolean } }): void => {
        if (!node.data?.color) {
            node.data = {
                ...node.data,
                color: '#CCCCCC'
            };
        }
        setGraphData(prev => ({
            nodes: [...prev.nodes, node],
            edges: prev.edges
        }));
    };

    const handleColorNode = (nodeId: string, color: string): void => {
        setGraphData(prev => ({
            ...prev,
            nodes: prev.nodes.map((node) =>
                node.data.id === nodeId
                    ? { ...node, data: { ...node.data, color } }
                    : node
            )
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

    const handleColorCountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
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
                .filter((node) => !node.data.isColorNode)
                .map((node) => ({ ...node, data: { ...node.data, color: '#CCCCCC' } }))
        }));
        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }
    };

    const resetColoration = () => {
        if (cyRef.current) {
            cyRef.current.nodes().forEach((node) => {
                if (!node.data('isColorNode')) {
                    node.data('color', '#CCCCCC');
                }
            });
        }
        setGraphData(prev => ({
            ...prev,
            nodes: prev.nodes.map((node) =>
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
                nodeColors.set(node.id(), node.data('color') || defaultColor);
            }
        });

        cyRef.current.nodes().forEach((node) => {
            if (node.data('isColorNode')) return;
            const nodeColor = nodeColors.get(node.id());
            if (nodeColor === defaultColor) {
                isCompleted = false;
            } else {
                usedColors.add(nodeColor);
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
                message: "Tous les sommets ne sont pas colorés."
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
        const pastilleCounts: Record<string, number> = {};
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
                tabletCounts: getPastilleCounts()
            };
        }
        return graphData;
    }, [isLibreMode, graphData, colorCount]);

    const handleClosePopup = () => {
        setValidationPopup(null);
    };

    return (
        <div className="workshop-container">
            <button className="workshop-back-btn" onClick={() => navigate('/coloration')}>&larr; Retour</button>
            <h2 className="workshop-title">Mode Création</h2>

            <div className="workshop-top-bar">
                <div className="coloration-color-input">
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
                <div className="workshop-buttons-row">
                    <button className="workshop-btn workshop-btn-add" onClick={() => {
                        if (cyRef.current) {
                            const newNodeId = `node-${graphData.nodes.length}-${Date.now()}`;
                            const newNode = {
                                group: 'nodes' as const,
                                data: { 
                                    id: newNodeId,
                                    label: newNodeId,
                                    color: '#CCCCCC'
                                },
                                position: {
                                    x: Math.random() * 800 + 100,
                                    y: Math.random() * 400 + 100
                                },
                                locked: false,
                                removed: false,
                                selected: false,
                                selectable: true,
                                grabbable: true,
                                pannable: false,
                                classes: ''
                            };
                            handleAddNode(newNode);
                        }
                    }}>
                        Ajouter un sommet
                    </button>
                    <button className="workshop-btn workshop-btn-reset" onClick={resetGraph}>
                        Réinitialiser le graphe
                    </button>
                    <button className="workshop-btn workshop-btn-rearrange" onClick={rearrangeGraph}>
                        Réarranger le graphe
                    </button>
                    <button className="workshop-btn workshop-btn-try" onClick={tryGraph}>
                        Essayer le graphe
                    </button>
                </div>
            ) : (
                <div className="workshop-buttons-row">
                    <button className="workshop-btn workshop-btn-validate" onClick={validateColoration}>
                        Valider la coloration
                    </button>
                    <button className="workshop-btn workshop-btn-reset" onClick={resetColoration}>
                        Réinitialiser la coloration
                    </button>
                    <button className="workshop-btn workshop-btn-back" onClick={returnToEditor}>
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
                onColorNode={handleColorNode}
            />

            {!isLibreMode && (
                <button className="workshop-rules-btn" onClick={() => setShowRules(true)}>&#9432; Voir les règles</button>
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
                        <li>Tu disposes d'un nombre illimité de pastilles que tu dois placer correctement.</li>
                    </ul>

                    <h3>🛠️ Comment créer un <strong>Graphe</strong></h3>
                    <ul>
                        <li>Clique sur le bouton <strong>Ajouter un sommet</strong> pour ajouter un sommet au graphe.</li>
                        <li>Le sommet est déjà placé à un endroit aléatoire. Déplace le sommet en le faisant glisser là où tu le souhaites.</li>
                        <li>En faisant un clic gauche sur un sommet puis un autre clic gauche sur un autre sommet, tu peux ajouter une arête entre les deux sommets.</li>
                        <li>Tu as la possibilité de choisir le nombre de couleurs que tu veux utiliser.</li>
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

export default Creation; 