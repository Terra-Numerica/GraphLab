import { kruskalAlgorithm } from '../../../utils/kruskalUtils';
import { boruvkaAlgorithm } from '../../../utils/boruvkaUtils';
import { primAlgorithm } from '../../../utils/primUtils';
import { exchangePropertyAlgorithm } from '../../../utils/exchangePropertyUtils';
import { useState, useCallback, useEffect } from 'react';
import { getDarkerColor, getLighterColor } from '../../../utils/colorUtils';
import ValidationPopup from '../../common/ValidationPopup';

// ❌ supprimé : import '../../../styles/pages/ArbreCouvrant/ArbreCouvrantStyles.css';

const algoMap = {
    prim: {
        algorithm: primAlgorithm,
        nodeStartClass: 'algo-node-start algo-prim-start',
        edgeClass: 'algo-edge-selected algo-prim-selected',
    },
    kruskal: {
        algorithm: kruskalAlgorithm,
        edgeClass: 'algo-edge-selected algo-kruskal-selected',
    },
    boruvka: {
        algorithm: boruvkaAlgorithm,
        edgeClass: 'algo-edge-selected algo-boruvka-selected',
        componentClass: 'algo-boruvka-component',
        minEdgeClass: 'algo-boruvka-min-edge',
    },
    'exchange-property': {
        algorithm: exchangePropertyAlgorithm,
        edgeClass: 'algo-edge-selected algo-exchange-selected',
        discardedEdgeClass: 'algo-exchange-excluded',
        cycleEdgeClass: 'algo-exchange-cycle',
        removingEdgeClass: 'algo-exchange-removing',
        addingEdgeClass: 'algo-exchange-adding',
        componentClass: 'algo-exchange-component',
        treeReachedClass: 'algo-exchange-tree-reached',
        doneProcessingClass: 'algo-exchange-done-processing',
    },
};

const AlgoVisualization = ({ algo, graph, cyRef, onSelectedEdgesChange, graphDisplay, componentsInfo }) => {
    const [isAutomatic, setIsAutomatic] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [currentStep, setCurrentStep] = useState(-1);
    const [steps, setSteps] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [order, setOrder] = useState('CROISSANT');

    const config = algoMap[algo];

    useEffect(() => {
        if (!graph) return;
        const newSteps = config.algorithm(graph.data.nodes, graph.data.edges, order);
        setSteps(newSteps);
        setCurrentStep(-1);
        setExplanation(
            `Pour commencer la visualisation, clique sur "Démarrer" (en mode automatique) ou "Étape suivante" (en mode manuel)`
        );
    }, [graph, config, order]);

    useEffect(() => {
        let interval;
        if (isAutomatic && isPlaying && currentStep < steps.length) {
            interval = setInterval(() => {
                setCurrentStep((prev) => {
                    if (prev >= steps.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, speed);
        }
        return () => clearInterval(interval);
    }, [isAutomatic, isPlaying, currentStep, steps.length, speed]);

    useEffect(() => {
        if (steps.length > 0 && currentStep === steps.length - 1) {
            setShowSuccessPopup(true);
        }
    }, [currentStep, steps.length]);

    useEffect(() => {
        if (!onSelectedEdgesChange || steps.length === 0) return;

        const selectedEdges = [];
        if (currentStep >= 0) {
            for (let i = 0; i <= currentStep; i++) {
                const step = steps[i];
                if (step.action === 'add' && step.edge) {
                    selectedEdges.push(step.edge);
                } else if (step.action === 'select_edge' && step.edge) {
                    selectedEdges.push(step.edge);
                } else if (step.action === 'exchange' && step.add) {
                    selectedEdges.push(step.add);
                } else if (step.action === 'exchange' && step.remove) {
                    const removeIndex = selectedEdges.findIndex((e) => e.data.id === step.remove.data.id);
                    if (removeIndex !== -1) selectedEdges.splice(removeIndex, 1);
                }
            }
        }
        onSelectedEdgesChange(selectedEdges);
    }, [currentStep, steps, algo, onSelectedEdgesChange]);

    useEffect(() => {
        if (!cyRef.current || steps.length === 0) return;

        cyRef.current
            .edges()
            .removeClass(
                'algo-edge-selected algo-prim-selected algo-kruskal-selected algo-boruvka-selected algo-boruvka-min-edge algo-exchange-selected algo-exchange-excluded algo-exchange-cycle algo-exchange-removing algo-exchange-adding algo-exchange-tree-reached algo-exchange-done-processing'
            )
            .style({
                'line-color': '#666',
                width: 3,
                opacity: 1,
            });
        cyRef.current
            .nodes()
            .removeClass('algo-node-start algo-prim-start algo-boruvka-component algo-exchange-component')
            .style({
                'background-color': '#b0b0b0',
                'border-width': 1,
                'border-color': '#444',
            });

        if (currentStep >= 0) {
            for (let i = 0; i <= currentStep; i++) {
                const step = steps[i];

                if (step.edge) {
                    const edge = cyRef.current.getElementById(step.edge.data.id);
                    if (edge) {
                        if (algo === 'boruvka' && step.action === 'min_edge') {
                            edge.addClass(config.minEdgeClass);
                        } else {
                            edge.addClass(config.edgeClass);
                        }
                        if (algo === 'prim' && step.componentColor) {
                            edge.style({
                                'line-color': getLighterColor(step.componentColor),
                                width: 4,
                                opacity: 1,
                            });
                        } else {
                            edge.style({
                                'line-color': '#9400D3',
                                width: 4,
                                opacity: 1,
                            });
                        }
                    }
                }

                if (algo === 'prim' && step.visitedNodes) {
                    step.visitedNodes.forEach((nodeId) => {
                        const node = cyRef.current.getElementById(nodeId);
                        if (node) {
                            node.addClass(config.nodeStartClass);
                            if (step.componentColor) {
                                node.style({
                                    'background-color': step.componentColor,
                                    'border-color': getDarkerColor(step.componentColor),
                                    'border-width': 2,
                                });
                            }
                        }
                    });
                }

                if (algo === 'prim' && step.action === 'start' && step.node) {
                    const node = cyRef.current.getElementById(step.node);
                    if (node) node.addClass(config.nodeStartClass);
                }

                if (algo === 'boruvka' && step.action === 'start') {
                    cyRef.current.nodes().addClass(config.componentClass);
                }

                if (algo === 'exchange-property') {
                    if (step.keptEdges) {
                        step.keptEdges.forEach((keptEdge) => {
                            const edge = cyRef.current.getElementById(keptEdge.data.id);
                            if (edge) {
                                edge.addClass(config.edgeClass);
                                edge.style({ 'line-color': '#34db8a', width: 4, opacity: 1 });
                            }
                        });
                    }
                    if (step.discardedEdges) {
                        step.discardedEdges.forEach((discardedEdge) => {
                            const edge = cyRef.current.getElementById(discardedEdge.data.id);
                            if (edge) {
                                edge.addClass(config.discardedEdgeClass);
                                edge.style({ 'line-color': '#c0392b', width: 5, opacity: 0.8 });
                            }
                        });
                    }
                    if (step.cycleEdges) {
                        step.cycleEdges.forEach((cycleEdge) => {
                            const edge = cyRef.current.getElementById(cycleEdge.data.id);
                            if (edge) {
                                edge.addClass(config.cycleEdgeClass);
                                edge.style({ 'line-color': '#f39c12', width: 5, opacity: 0.8 });
                            }
                        });
                    }
                    if (step.action === 'exchange') {
                        if (step.add) {
                            const addEdge = cyRef.current.getElementById(step.add.data.id);
                            if (addEdge) {
                                addEdge.addClass(config.addingEdgeClass);
                                addEdge.style({ 'line-color': '#00aa00', width: 5, opacity: 1 });
                            }
                        }
                        if (step.remove) {
                            const removeEdge = cyRef.current.getElementById(step.remove.data.id);
                            if (removeEdge) {
                                removeEdge.addClass(config.removingEdgeClass);
                                removeEdge.style({ 'line-color': '#aa0000', width: 5, opacity: 0.7 });
                            }
                        }
                    }
                    if (step.action === 'tree-reached') {
                        step.keptEdges.forEach((keptEdge) => {
                            const edge = cyRef.current.getElementById(keptEdge.data.id);
                            if (edge) {
                                edge.addClass(config.treeReachedClass);
                                edge.style({ 'line-color': '#2ecc71', width: 6, opacity: 1 });
                            }
                        });
                    }
                    if (step.action === 'done-processing') {
                        step.keptEdges.forEach((keptEdge) => {
                            const edge = cyRef.current.getElementById(keptEdge.data.id);
                            if (edge) {
                                edge.addClass(config.doneProcessingClass);
                                edge.style({ 'line-color': '#27ae60', width: 5, opacity: 1 });
                            }
                        });
                    }
                }
            }
        }

        if (currentStep >= 0 && steps[currentStep]) {
            setExplanation(steps[currentStep].explanation);
        } else {
            setExplanation('');
        }
    }, [currentStep, steps, cyRef, algo, config]);

    const handleNextStep = useCallback(() => {
        if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
    }, [currentStep, steps.length]);

    const handlePreviousStep = useCallback(() => {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
    }, [currentStep]);

    const handlePlayPause = useCallback(() => {
        if (isPlaying) {
            setIsPlaying(false);
        } else {
            if (currentStep === steps.length - 1) {
                setCurrentStep(0);
                setTimeout(() => setIsPlaying(true), 0);
            } else {
                setIsPlaying(true);
            }
        }
    }, [isPlaying, currentStep, steps.length]);

    const handleReset = useCallback(() => {
        setCurrentStep(0);
        setIsPlaying(false);
    }, []);

    const handleSpeedChange = useCallback((newSpeed) => {
        setSpeed(newSpeed);
    }, []);

    const handleSpeedUp = useCallback(() => {
        if (speed === 2000) setSpeed(1000);
        else if (speed === 1000) setSpeed(500);
    }, [speed]);

    const handleSpeedDown = useCallback(() => {
        if (speed === 500) setSpeed(1000);
        else if (speed === 1000) setSpeed(2000);
    }, [speed]);

    const handleModeChange = useCallback((mode) => {
        setIsAutomatic(mode === 'automatic');
        setIsPlaying(false);
    }, []);

    const handleCloseSuccessPopup = useCallback(() => {
        setShowSuccessPopup(false);
    }, []);

    const handleOrderChange = useCallback((newOrder) => {
        setOrder(newOrder);
        setCurrentStep(-1);
        setIsPlaying(false);
    }, []);

    return (
        <>
            {/* Header résumé + actions haut de page — géré ailleurs dans ton app */}

            {/* GRID 3 COLONNES COMME LA CAPTURE */}
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-12">

                {/* Colonne gauche : MODE + NAVIGATION */}
                <div className="md:col-span-2 flex flex-col gap-4">
                    {/* MODE */}
                    <div className="rounded-2xl bg-white p-4 shadow">
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mode</div>
                        <div className="mt-3 flex flex-col gap-2">
                            <button
                                className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue/40 ${!isAutomatic
                                        ? 'bg-blue text-white'
                                        : 'border border-gray-200 text-darkBlue hover:bg-blue hover:text-white'
                                    }`}
                                onClick={() => handleModeChange('manual')}
                            >
                                <span className="mr-2">🖱️</span> Manuel
                            </button>
                            <button
                                className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue/40 ${isAutomatic
                                        ? 'bg-blue text-white'
                                        : 'border border-gray-200 text-darkBlue hover:bg-blue hover:text-white'
                                    }`}
                                onClick={() => handleModeChange('automatic')}
                            >
                                <span className="mr-2">▶️</span> Auto
                            </button>
                        </div>
                    </div>

                    {/* NAVIGATION */}
                    <div className="rounded-2xl bg-white p-4 shadow">
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Navigation</div>

                        {!isAutomatic ? (
                            <div className="mt-3 flex flex-col gap-3">
                                <button
                                    className="w-full rounded-xl border-2 border-blue px-4 py-2.5 text-sm font-semibold text-blue transition hover:bg-blue hover:text-white focus:outline-none focus:ring-2 focus:ring-blue/40 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={handlePreviousStep}
                                    disabled={currentStep <= 0}
                                >
                                    ⏮️ Précédent
                                </button>
                                <button
                                    className="w-full rounded-xl border-2 border-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-600 transition hover:bg-amber-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={handleReset}
                                    disabled={currentStep === -1}
                                >
                                    🔁 Réinitialiser
                                </button>
                                <button
                                    className="w-full rounded-xl border-2 border-green px-4 py-2.5 text-sm font-semibold text-green transition hover:bg-green hover:text-white focus:outline-none focus:ring-2 focus:ring-green/40 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={handleNextStep}
                                    disabled={currentStep === steps.length - 1}
                                >
                                    ⏭️ Suivant
                                </button>
                            </div>
                        ) : (
                            <div className="mt-3 flex flex-col gap-3">
                                <button
                                    className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue/40 ${isPlaying
                                            ? 'border-2 border-amber-500 text-amber-600 hover:bg-amber-500 hover:text-white'
                                            : 'border-2 border-green text-green hover:bg-green hover:text-white'
                                        }`}
                                    onClick={handlePlayPause}
                                >
                                    {isPlaying ? '⏸️ Pause' : '▶️ Démarrer'}
                                </button>

                                <div className="grid grid-cols-3 items-center gap-2">
                                    <button
                                        className="rounded-xl border-2 border-blue px-3 py-2 text-sm font-semibold text-blue transition hover:bg-blue hover:text-white focus:outline-none focus:ring-2 focus:ring-blue/40 disabled:cursor-not-allowed disabled:opacity-50"
                                        onClick={handleSpeedDown}
                                        title="Ralentir"
                                        disabled={speed === 2000}
                                    >
                                        ⏪
                                    </button>
                                    <div className="rounded-xl border border-gray-200 px-2 py-2 text-center text-sm font-semibold text-darkBlue">
                                        {speed === 2000 ? '0.5x' : speed === 1000 ? '1x' : '2x'}
                                    </div>
                                    <button
                                        className="rounded-xl border-2 border-blue px-3 py-2 text-sm font-semibold text-blue transition hover:bg-blue hover:text-white focus:outline-none focus:ring-2 focus:ring-blue/40 disabled:cursor-not-allowed disabled:opacity-50"
                                        onClick={handleSpeedUp}
                                        title="Accélérer"
                                        disabled={speed === 500}
                                    >
                                        ⏩
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Option d’ordre (uniquement pour exchange-property) */}
                        {algo === 'exchange-property' && (
                            <div className="mt-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ordre de tri</div>
                                <div className="mt-2 grid grid-cols-3 gap-2">
                                    <button
                                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue/40 ${order === 'CROISSANT'
                                                ? 'bg-blue text-white'
                                                : 'border border-gray-200 text-darkBlue hover:bg-blue hover:text-white'
                                            }`}
                                        onClick={() => handleOrderChange('CROISSANT')}
                                    >
                                        ⬆️
                                    </button>
                                    <button
                                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue/40 ${order === 'DECROISSANT'
                                                ? 'bg-blue text-white'
                                                : 'border border-gray-200 text-darkBlue hover:bg-blue hover:text-white'
                                            }`}
                                        onClick={() => handleOrderChange('DECROISSANT')}
                                    >
                                        ⬇️
                                    </button>
                                    <button
                                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue/40 ${order === 'ALEATOIRE'
                                                ? 'bg-blue text-white'
                                                : 'border border-gray-200 text-darkBlue hover:bg-blue hover:text-white'
                                            }`}
                                        onClick={() => handleOrderChange('ALEATOIRE')}
                                    >
                                        🎲
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Panneau progression */}
                    <div className="rounded-2xl bg-white p-4 shadow">
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">Progression</div>
                        <div className="flex items-center justify-center">
                            <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-darkBlue shadow-sm">
                                Étape {currentStep >= 0 ? currentStep + 1 : 0} sur {steps.length}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colonne centre : GraphDisplay */}
                <div className="md:col-span-8 flex flex-col gap-4">
                    {/* Graph Display */}
                    {graphDisplay && (
                        <div className="flex-1 overflow-hidden rounded-2xl bg-white p-3 shadow min-h-[400px]">
                            {graphDisplay}
                        </div>
                    )}
                </div>

                {/* Colonne droite : Composantes + Explication */}
                <div className="md:col-span-2 flex flex-col gap-4">
                    {/* Composantes */}
                    {componentsInfo && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                            <div className="font-semibold mb-2">Composantes :</div>
                            <div className="text-xs">
                                {componentsInfo}
                            </div>
                        </div>
                    )}

                    {/* Explication */}
                    <div className="rounded-2xl bg-white p-4 shadow">
                        <div className="flex items-center gap-2">
                            <span>💡</span>
                            <div className="text-sm font-semibold text-darkBlue">Explication</div>
                        </div>
                        <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-sm text-gray-700">
                            {currentStep >= 0 ? explanation : (
                                <>Sélectionnez un mode et commencez la visualisation pour voir les explications détaillées de chaque étape.</>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup succès */}
            {showSuccessPopup && (
                <ValidationPopup
                    type="success"
                    title="Algorithme terminé"
                    message="L'algorithme a été réalisé avec succès"
                    onClose={handleCloseSuccessPopup}
                />
            )}
        </>
    );

};

export default AlgoVisualization;