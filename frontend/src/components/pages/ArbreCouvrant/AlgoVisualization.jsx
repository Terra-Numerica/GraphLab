import { kruskalAlgorithm } from '../../../utils/kruskalUtils';
import { boruvkaAlgorithm } from '../../../utils/boruvkaUtils';
import { primAlgorithm } from '../../../utils/primUtils';
import { exchangePropertyAlgorithm } from '../../../utils/exchangePropertyUtils';
import { useState, useCallback, useEffect } from 'react';
import { getDarkerColor, getLighterColor } from '../../../utils/colorUtils';

import '../../../styles/pages/ArbreCouvrant/AlgoVisualization.css';

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
        excludedEdgeClass: 'algo-edge-excluded algo-exchange-excluded',
        cycleEdgeClass: 'algo-edge-cycle algo-exchange-cycle',
    }
};

const AlgoVisualization = ({ algo, graph, cyRef }) => {
    const [isAutomatic, setIsAutomatic] = useState(false);
    const [speed, setSpeed] = useState(1000);
    const [currentStep, setCurrentStep] = useState(-1);
    const [steps, setSteps] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [explanation, setExplanation] = useState('');

    const config = algoMap[algo];

    useEffect(() => {
        if (!graph) return;
        const newSteps = config.algorithm(graph.data.nodes, graph.data.edges);
        setSteps(newSteps);
        setExplanation(`Pour commencer la visualisation, clique sur "Démarrer" (en mode automatique) ou "Étape suivante" (en mode manuel)`);
    }, [graph, config]);

    useEffect(() => {
        let interval;
        if (isAutomatic && isPlaying && currentStep < steps.length) {
            interval = setInterval(() => {
                setCurrentStep(prev => {
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
        if (!cyRef.current || steps.length === 0) return;
        
        // Réinitialiser tous les styles
        cyRef.current.edges().removeClass('algo-edge-selected algo-prim-selected algo-kruskal-selected algo-boruvka-selected algo-boruvka-min-edge algo-edge-excluded algo-exchange-excluded algo-edge-cycle algo-exchange-cycle')
            .style({
                'line-color': '#666',
                'width': 3,
                'opacity': 1
            });
        cyRef.current.nodes().removeClass('algo-node-start algo-prim-start algo-boruvka-component')
            .style({
                'background-color': '#b0b0b0',
                'border-width': 1,
                'border-color': '#444'
            });
            
        if (currentStep >= 0) {
            for (let i = 0; i <= currentStep; i++) {
                const step = steps[i];
                
                // Traiter les arêtes
                if (step.edge) {
                    const edge = cyRef.current.getElementById(step.edge.data.id);
                    if (edge) {
                        if (algo === 'boruvka' && step.action === 'min_edge') {
                            edge.addClass(config.minEdgeClass);
                        } else {
                            edge.addClass(config.edgeClass);
                        }
                        
                        // Colorer l'arête selon l'algorithme
                        if (algo === 'prim' && step.componentColor) {
                            edge.style({
                                'line-color': getLighterColor(step.componentColor),
                                'width': 4,
                                'opacity': 1
                            });
                        } else {
                            edge.style({
                                'line-color': '#9400D3',
                                'width': 4,
                                'opacity': 1
                            });
                        }
                    }
                }
                
                // Colorer les nœuds pour Prim
                if (algo === 'prim' && step.visitedNodes) {
                    step.visitedNodes.forEach(nodeId => {
                        const node = cyRef.current.getElementById(nodeId);
                        if (node) {
                            node.addClass(config.nodeStartClass);
                            if (step.componentColor) {
                                node.style({
                                    'background-color': step.componentColor,
                                    'border-color': getDarkerColor(step.componentColor),
                                    'border-width': 2
                                });
                            }
                        }
                    });
                }
                
                // Traitement spécifique pour le démarrage de Prim
                if (algo === 'prim' && step.action === 'start' && step.node) {
                    const node = cyRef.current.getElementById(step.node);
                    if (node) {
                        node.addClass(config.nodeStartClass);
                    }
                }
                
                // Traitement spécifique pour Boruvka
                if (algo === 'boruvka' && step.action === 'start') {
                    cyRef.current.nodes().addClass(config.componentClass);
                }
                
                // Traitement spécifique pour l'algorithme de la propriété d'échange
                if (algo === 'exchange-property') {
                    // Colorer les nœuds visités (comme Prim)
                    if (step.visitedNodes) {
                        step.visitedNodes.forEach(nodeId => {
                            const node = cyRef.current.getElementById(nodeId);
                            if (node) {
                                node.addClass('algo-node-start');
                                if (step.componentColor) {
                                    node.style({
                                        'background-color': step.componentColor,
                                        'border-color': '#2c3e50',
                                        'border-width': 2
                                    });
                                }
                            }
                        });
                    }
                    
                    // Traitement selon le type d'action
                    if (step.action === 'add' && step.edge) {
                        const edge = cyRef.current.getElementById(step.edge.data.id);
                        if (edge) {
                            edge.addClass(config.edgeClass);
                            edge.style({
                                'line-color': '#34db8a',
                                'width': 4,
                                'opacity': 1
                            });
                        }
                    }
                    
                    if (step.action === 'exchange') {
                        // Mettre en évidence l'arête ajoutée
                        if (step.edgeAdded) {
                            const edge = cyRef.current.getElementById(step.edgeAdded.data.id);
                            if (edge) {
                                edge.addClass(config.edgeClass);
                                edge.style({
                                    'line-color': '#34db8a',
                                    'width': 4,
                                    'opacity': 1
                                });
                            }
                        }
                        
                        // Mettre en évidence l'arête retirée
                        if (step.edgeRemoved) {
                            const edge = cyRef.current.getElementById(step.edgeRemoved.data.id);
                            if (edge) {
                                edge.addClass(config.excludedEdgeClass);
                                edge.style({
                                    'line-color': '#e74c3c',
                                    'width': 3,
                                    'opacity': 0.4
                                });
                            }
                        }
                    }
                    
                    if (step.action === 'result' && step.treeEdges) {
                        // Réinitialiser toutes les arêtes
                        cyRef.current.edges().style({
                            'line-color': '#666',
                            'width': 3,
                            'opacity': 1
                        });
                        
                        // Colorer les arêtes de l'arbre final
                        step.treeEdges.forEach(treeEdge => {
                            const edge = cyRef.current.getElementById(treeEdge.data.id);
                            if (edge) {
                                edge.addClass(config.edgeClass);
                                edge.style({
                                    'line-color': '#34db8a',
                                    'width': 4,
                                    'opacity': 1
                                });
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
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    }, [currentStep, steps.length]);

    const handlePreviousStep = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
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

    const handleModeChange = useCallback((mode) => {
        setIsAutomatic(mode === 'automatic');
        setIsPlaying(false);
    }, []);

    return (
        <div className="tree-mode-visualization-panel">
            <div className="tree-mode-controls">
                <div className="tree-mode-selector">
                    <button
                        className={`tree-mode-btn ${!isAutomatic ? 'active' : ''}`}
                        onClick={() => handleModeChange('manual')}
                    >
                        Mode Manuel
                    </button>
                    <button
                        className={`tree-mode-btn ${isAutomatic ? 'active' : ''}`}
                        onClick={() => handleModeChange('automatic')}
                    >
                        Mode Automatique
                    </button>
                </div>
                {!isAutomatic ? (
                    <div className="tree-mode-step-controls">
                        <button
                            className="tree-mode-btn"
                            onClick={handlePreviousStep}
                            disabled={currentStep <= 0}
                        >
                            ← Précédent
                        </button>
                        <button
                            className="tree-mode-btn"
                            onClick={handleReset}
                            disabled={currentStep === -1}
                        >
                            Réinitialiser
                        </button>
                        <button
                            className="tree-mode-btn"
                            onClick={handleNextStep}
                            disabled={currentStep === steps.length - 1}
                        >
                            Suivant →
                        </button>
                    </div>
                ) : (
                    <div className="tree-mode-speed-controls">
                        <button
                            className={`tree-mode-btn ${isPlaying ? 'pause' : 'play'} tree-mode-btn-playpause`}
                            onClick={handlePlayPause}
                        >
                            {isPlaying ? '⏸️ Pause' : '▶️ Démarrer'}
                        </button>
                        <button className="tree-mode-btn" onClick={() => handleSpeedChange(2000)} title="Lent">⏪</button>
                        <button className="tree-mode-btn" onClick={() => handleSpeedChange(1000)} title="Vitesse normale">1x</button>
                        <button className="tree-mode-btn" onClick={() => handleSpeedChange(500)} title="Rapide">⏩</button>
                        <div className="tree-mode-speed-indicator">
                            Vitesse: {speed === 2000 ? 'Lente' : speed === 1000 ? 'Normale' : 'Rapide'}
                        </div>
                    </div>
                )}
                <div className="tree-mode-progress">
                    Étape {currentStep >= 0 ? currentStep + 1 : 0} sur {steps.length}
                </div>
            </div>
            <div className="tree-mode-explanation-box">
                {currentStep >= 0 && explanation}
            </div>
        </div>
    );
};

export default AlgoVisualization; 