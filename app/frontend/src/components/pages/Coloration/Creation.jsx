// Imports
import { colors as colorPalette } from '../../../utils/colorPalette';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useTimer } from '../../../hooks/useTimer';
import { useNavigate } from 'react-router-dom';

import ValidationPopup from '../../common/ValidationPopup';
import TimerDisplay from '../../common/TimerDisplay';
import RulesPopup from '../../common/RulesPopup';
import GraphDisplay from './GraphDisplay';

// ❌ supprimé : import '../../../styles/pages/Coloration/ColorationStyles.css';

const Creation = () => {
    const navigate = useNavigate();
    const cyRef = useRef(null);
    const { time, isRunning, start, stop, reset, formatTime } = useTimer();
    const [colorCount, setColorCount] = useState('');
    const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
    const [validationPopup, setValidationPopup] = useState(null);
    const [showRules, setShowRules] = useState(false);
    const [isLibreMode, setIsLibreMode] = useState(false);

    useEffect(() => {
        document.body.style.overflow = showRules ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [showRules]);

    const handleAddNode = (node) => {
        if (!node.data?.color) {
            node.data = { ...node.data, color: '#CCCCCC' };
        }
        setGraphData(prev => ({ nodes: [...prev.nodes, node], edges: prev.edges }));
    };

    const handleColorNode = (nodeId, color) => {
        setGraphData(prev => ({
            ...prev,
            nodes: prev.nodes.map(node =>
                node.data.id === nodeId ? { ...node, data: { ...node.data, color } } : node
            )
        }));
    };

    const handleAddEdge = (edge) => {
        setGraphData(prev => ({ nodes: prev.nodes, edges: [...prev.edges, edge] }));
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
            const layoutOptions = { name: 'circle', fit: true, padding: 30, avoidOverlap: true };
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
                if (!node.data('isColorNode')) node.data('color', '#CCCCCC');
            });
        }
        setGraphData(prev => ({
            ...prev,
            nodes: prev.nodes.map(node =>
                node.data.isColorNode ? node : { ...node, data: { ...node.data, color: '#CCCCCC' } }
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
            if (!node.data('isColorNode')) nodeColors.set(node.id(), node.data('color') || defaultColor);
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
            setValidationPopup({ type: 'warning', title: 'Attention !', message: "Tous les sommets ne sont pas colorés." });
        } else if (!isValid) {
            setValidationPopup({ type: 'error', title: 'Erreur !', message: 'Deux sommets adjacents ont la même couleur.' });
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
        for (let i = 0; i < count; i++) pastilleCounts[colorPalette[i]] = Infinity;
        return pastilleCounts;
    };

    const memoizedGraphData = useMemo(() => {
        if (isLibreMode) {
            return { nodes: graphData.nodes, edges: graphData.edges, tabletCounts: getPastilleCounts() };
        }
        return graphData;
    }, [isLibreMode, graphData, colorCount]);

    const handleClosePopup = () => setValidationPopup(null);

    return (
        <div className="w-full bg-gray-100 px-4 sm:px-8 md:px-16 py-8">
            <div className="mx-auto max-w-6xl">
                {/* Back */}
                <button
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-blue px-4 py-2 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                    onClick={() => navigate('/coloration')}
                >
                    <span aria-hidden="true">←</span> Retour
                </button>

                {/* Title */}
                <h2 className="mt-4 text-center text-3xl md:text-4xl font-bold text-darkBlue">Mode Création</h2>

                {/* Top bar */}
                <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow md:flex-row md:items-center md:justify-between">
                    {/* Nombre de couleurs */}
                    <div className="flex items-center gap-3">
                        <label htmlFor="colorCount" className="text-sm font-medium text-darkBlue">
                            Nombre de couleurs :
                        </label>
                        <input
                            type="number"
                            id="colorCount"
                            value={colorCount}
                            onChange={handleColorCountChange}
                            min={1}
                            max={12}
                            disabled={isLibreMode}
                            placeholder="Optionnel"
                            className="w-28 rounded-xl border border-grey bg-white px-3 py-2 text-astro shadow-sm placeholder:text-grey/70 disabled:bg-grey/10 disabled:text-grey focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
                        />
                    </div>

                    {/* Timer */}
                    <div className="flex items-center justify-end">
                        <TimerDisplay time={time} formatTime={formatTime} />
                    </div>
                </div>

                {/* Buttons row */}
                {!isLibreMode ? (
                    <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-blue px-5 py-2.5 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                            onClick={() => {
                                if (cyRef.current) {
                                    const newNodeId = `node-${graphData.nodes.length}-${Date.now()}`;
                                    const newNode = {
                                        group: 'nodes',
                                        data: { id: newNodeId, color: '#CCCCCC' },
                                        position: { x: Math.random() * 800 + 100, y: Math.random() * 400 + 100 },
                                        locked: false
                                    };
                                    handleAddNode(newNode);
                                }
                            }}
                        >
                            Ajouter un sommet
                        </button>

                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-red px-5 py-2.5 text-sm font-semibold text-red hover:bg-red hover:text-white transition focus:outline-none focus:ring-2 focus:ring-red/40"
                            onClick={resetGraph}
                        >
                            Réinitialiser le graphe
                        </button>

                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-amber-500 px-5 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                            onClick={rearrangeGraph}
                        >
                            Réarranger le graphe
                        </button>

                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-green px-5 py-2.5 text-sm font-semibold text-green hover:bg-green hover:text-white transition focus:outline-none focus:ring-2 focus:ring-green/40"
                            onClick={tryGraph}
                        >
                            Essayer le graphe
                        </button>
                    </div>
                ) : (
                    <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-green px-5 py-2.5 text-sm font-semibold text-green hover:bg-green hover:text-white transition focus:outline-none focus:ring-2 focus:ring-green/40"
                            onClick={validateColoration}
                        >
                            Valider la coloration
                        </button>
                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-red px-5 py-2.5 text-sm font-semibold text-red hover:bg-red hover:text-white transition focus:outline-none focus:ring-2 focus:ring-red/40"
                            onClick={resetColoration}
                        >
                            Réinitialiser la coloration
                        </button>
                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-grey px-5 py-2.5 text-sm font-semibold text-darkBlue hover:bg-grey/10 transition focus:outline-none focus:ring-2 focus:ring-blue/30"
                            onClick={returnToEditor}
                        >
                            Revenir à l'éditeur
                        </button>
                    </div>
                )}

                {/* Graph area */}
                <div className="mt-6 overflow-hidden rounded-2xl bg-white p-3 shadow">
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
                </div>

                {/* Floating rules button */}
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
                        onClose={handleClosePopup}
                    />
                )}

                {showRules && (
                    <RulesPopup title="Règles du mode Création" onClose={() => setShowRules(false)}>
                        <h3>🎯 Objectif</h3>
                        <ul className="list-disc pl-5">
                            <li>Crée un graphe et colorie-le.</li>
                            <li>Deux sommets adjacents ne doivent jamais avoir la même couleur.</li>
                            <li>Tu disposes d'un nombre illimité de pastilles que tu dois placer correctement.</li>
                        </ul>

                        <h3 className="mt-4">🛠️ Comment créer un <strong>Graphe</strong></h3>
                        <ul className="list-disc pl-5">
                            <li>Clique sur le bouton <strong>Ajouter un sommet</strong> pour ajouter un sommet au graphe.</li>
                            <li>Le sommet est déjà placé à un endroit aléatoire. Déplace le sommet en le faisant glisser là où tu le souhaites.</li>
                            <li>En faisant un clic gauche sur un sommet puis un autre clic gauche sur un autre sommet, tu peux ajouter une arête entre les deux sommets.</li>
                            <li>Tu as la possibilité de choisir le nombre de couleurs que tu veux utiliser.</li>
                            <li>Dès que tu penses avoir terminé de créer ton graphe, clique sur le bouton <strong>Essayer le Graphe</strong> pour commencer à le colorer.</li>
                        </ul>

                        <h3 className="mt-4">🛠️ Comment jouer à la <strong>Coloration d'un Graphe</strong></h3>
                        <ul className="list-disc pl-5">
                            <li>Attrape une pastille de couleur, fais-la glisser vers un sommet et relâche-la pour lui attribuer cette couleur.</li>
                            <li>Colorie entièrement le graphe en respectant les règles de coloration.</li>
                            <li>Quand tu penses avoir réussi, clique sur le bouton <strong>Valider la Coloration</strong> pour vérifier si le graphe est correctement coloré.</li>
                            <li>Mets-toi au défi d'utiliser le moins de couleurs possible pour colorer le graphe !</li>
                        </ul>

                        <h3 className="mt-4">🔧 Fonctionnalités</h3>
                        <ul className="list-disc pl-5">
                            <li>Lors de la création, si tu penses que ton graphe n'est pas bien organisé, tu peux le réarranger en cliquant sur <strong>Réarranger le graphe</strong>.</li>
                            <li>Si tu penses avoir fait une erreur, tu peux faire un clic droit sur un sommet pour lui retirer sa couleur.</li>
                            <li>Si tu veux recommencer, clique sur <strong>Réinitialiser la Coloration</strong> pour remettre tous les sommets dans leur état initial.</li>
                        </ul>
                    </RulesPopup>
                )}
            </div>
        </div>
    );
};

export default Creation;