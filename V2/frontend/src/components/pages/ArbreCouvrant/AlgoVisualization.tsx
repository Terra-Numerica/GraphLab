import { kruskalAlgorithm } from '../../../utils/kruskalUtils';
import { boruvkaAlgorithm } from '../../../utils/boruvkaUtils';
import { primAlgorithm } from '../../../utils/primUtils';
import { exchangePropertyAlgorithm } from '../../../utils/exchangePropertyUtils';
import { useState, useCallback, useEffect } from 'react';
import { getDarkerColor, getLighterColor } from '../../../utils/colorUtils';
import ValidationPopup from '../../common/ValidationPopup';
import { Graph, Edge } from '../../../types';

type OrderType = 'CROISSANT' | 'DECROISSANT' | 'ALEATOIRE';

import '../../../styles/pages/ArbreCouvrant/ArbreCouvrantStyles.css';

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

interface AlgoVisualizationProps {
    algo: string;
    graph: Graph;
    cyRef: React.MutableRefObject<cytoscape.Core | null>;
    onSelectedEdgesChange: (edges: Edge[]) => void;
}

const AlgoVisualization: React.FC<AlgoVisualizationProps> = ({ algo, graph, cyRef, onSelectedEdgesChange }) => {
    const [isAutomatic, setIsAutomatic] = useState<boolean>(false);
    const [speed, setSpeed] = useState(1000);
    const [currentStep, setCurrentStep] = useState(-1);
    const [steps, setSteps] = useState<Array<{
        action: string;
        edge?: Edge;
        explanation: string;
        [key: string]: any;
    }>>([]);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [explanation, setExplanation] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
    const [order, setOrder] = useState<OrderType>('CROISSANT');

    const config = algoMap[algo as keyof typeof algoMap];

    useEffect(() => {
        if (!graph) return;
        const newSteps = config.algorithm(graph.data.nodes, graph.data.edges, order);
        setSteps(newSteps);
        setCurrentStep(-1);
        setExplanation(`Pour commencer la visualisation, clique sur "Démarrer" (en mode automatique) ou "Étape suivante" (en mode manuel)`);
    }, [graph, config, order]);

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined;
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

    // Show success popup when algorithm is completed
    useEffect(() => {
        if (steps.length > 0 && currentStep === steps.length - 1) {
            setShowSuccessPopup(true);
        }
    }, [currentStep, steps.length]);

    // Calculate selected edges up to current step and notify parent
    useEffect(() => {
        if (!onSelectedEdgesChange || steps.length === 0) return;
        
        const selectedEdges = [];
        if (currentStep >= 0) {
            for (let i = 0; i <= currentStep; i++) {
                const step = steps[i];
                
                // Handle different action types
                if (step.action === 'add' && step.edge) {
                    // Prim, Kruskal: add edge
                    selectedEdges.push(step.edge);
                } else if (step.action === 'select_edge' && step.edge) {
                    // Boruvka: select edge
                    selectedEdges.push(step.edge);
                } else if (step.action === 'exchange' && step.add) {
                    // Exchange: add edge
                    selectedEdges.push(step.add);
                } else if (step.action === 'exchange' && step.remove) {
                    // Exchange: remove edge from selection
                    const removeIndex = selectedEdges.findIndex((e: any) => 
                        e.data.id === step.remove.data.id
                    );
                    if (removeIndex !== -1) {
                        selectedEdges.splice(removeIndex, 1);
                    }
                }
            }
        }
        
        onSelectedEdgesChange(selectedEdges);
    }, [currentStep, steps, algo, onSelectedEdgesChange]);

    useEffect(() => {
        if (!cyRef.current || steps.length === 0) return;
        
        // Réinitialiser tous les styles
        cyRef.current.edges().removeClass('algo-edge-selected algo-prim-selected algo-kruskal-selected algo-boruvka-selected algo-boruvka-min-edge algo-exchange-selected algo-exchange-excluded algo-exchange-cycle algo-exchange-removing algo-exchange-adding algo-exchange-tree-reached algo-exchange-done-processing')
            .style({
                'line-color': '#666',
                'width': 3,
                'opacity': 1
            });
        cyRef.current.nodes().removeClass('algo-node-start algo-prim-start algo-boruvka-component algo-exchange-component')
            .style({
                'background-color': '#b0b0b0',
                'border-width': 1,
                'border-color': '#444'
            });
            
        if (currentStep >= 0) {
            for (let i = 0; i <= currentStep; i++) {
                const step = steps[i];
                
                // Traiter les arêtes
                if (step.edge && cyRef.current) {
                    const edge = cyRef.current.getElementById(step.edge.data.id);
                    if (edge) {
                        if (algo === 'boruvka' && step.action === 'min_edge') {
                            edge.addClass((config as any).minEdgeClass);
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
                if (algo === 'prim' && step.visitedNodes && cyRef.current) {
                    step.visitedNodes.forEach((nodeId: any) => {
                        const node = cyRef.current!.getElementById(nodeId);
                        if (node) {
                            node.addClass((config as any).nodeStartClass);
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
                if (algo === 'prim' && step.action === 'start' && step.node && cyRef.current) {
                    const node = cyRef.current.getElementById(step.node);
                    if (node) {
                        node.addClass((config as any).nodeStartClass);
                    }
                }
                
                // Traitement spécifique pour Boruvka
                if (algo === 'boruvka' && step.action === 'start' && cyRef.current) {
                    cyRef.current.nodes().addClass((config as any).componentClass);
                }
                
                // Traitement spécifique pour Exchange Property
                if (algo === 'exchange-property') {
                    // Gérer les arêtes conservées
                    if (step.keptEdges && cyRef.current) {
                        step.keptEdges.forEach((keptEdge: any) => {
                            const edge = cyRef.current!.getElementById(keptEdge.data.id);
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
                    
                    // Gérer les arêtes rejetées
                    if (step.discardedEdges && cyRef.current) {
                        step.discardedEdges.forEach((discardedEdge: any) => {
                            const edge = cyRef.current!.getElementById(discardedEdge.data.id);
                            if (edge) {
                                edge.addClass((config as any).discardedEdgeClass);
                                edge.style({
                                    'line-color': '#c0392b',
                                    'width': 5,
                                    'opacity': 0.8
                                });
                            }
                        });
                    }
                    
                    // Gérer les arêtes du cycle
                    if (step.cycleEdges && cyRef.current) {
                        step.cycleEdges.forEach((cycleEdge: any) => {
                            const edge = cyRef.current!.getElementById(cycleEdge.data.id);
                            if (edge) {
                                edge.addClass((config as any).cycleEdgeClass);
                                edge.style({
                                    'line-color': '#f39c12',
                                    'width': 5,
                                    'opacity': 0.8
                                });
                            }
                        });
                    }
                    
                    // Gérer l'échange d'arêtes
                    if (step.action === 'exchange' && cyRef.current) {
                        if (step.add) {
                            const addEdge = cyRef.current.getElementById(step.add.data.id);
                            if (addEdge) {
                                addEdge.addClass((config as any).addingEdgeClass);
                                addEdge.style({
                                    'line-color': '#00aa00',
                                    'width': 5,
                                    'opacity': 1
                                });
                            }
                        }
                        if (step.remove) {
                            const removeEdge = cyRef.current.getElementById(step.remove.data.id);
                            if (removeEdge) {
                                removeEdge.addClass((config as any).removingEdgeClass);
                                removeEdge.style({
                                    'line-color': '#aa0000',
                                    'width': 5,
                                    'opacity': 0.7
                                });
                            }
                        }
                    }
                    
                    // Gérer l'action 'tree-reached' - mettre en évidence l'arbre couvrant
                    if (step.action === 'tree-reached' && cyRef.current) {
                        step.keptEdges.forEach((keptEdge: any) => {
                            const edge = cyRef.current!.getElementById(keptEdge.data.id);
                            if (edge) {
                                edge.addClass((config as any).treeReachedClass);
                                edge.style({
                                    'line-color': '#2ecc71',
                                    'width': 6,
                                    'opacity': 1
                                });
                            }
                        });
                    }
                    
                    // Gérer l'action 'done-processing' - finaliser l'affichage
                    if (step.action === 'done-processing' && cyRef.current) {
                        step.keptEdges.forEach((keptEdge: any) => {
                            const edge = cyRef.current!.getElementById(keptEdge.data.id);
                            if (edge) {
                                edge.addClass((config as any).doneProcessingClass);
                                edge.style({
                                    'line-color': '#27ae60',
                                    'width': 5,
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


    const handleSpeedUp = useCallback(() => {
        if (speed === 2000) {
            setSpeed(1000); // 0.5x -> 1x
        } else if (speed === 1000) {
            setSpeed(500); // 1x -> 2x
        }
        // Si déjà à 2x, on reste à 2x
    }, [speed]);

    const handleSpeedDown = useCallback(() => {
        if (speed === 500) {
            setSpeed(1000); // 2x -> 1x
        } else if (speed === 1000) {
            setSpeed(2000); // 1x -> 0.5x
        }
        // Si déjà à 0.5x, on reste à 0.5x
    }, [speed]);

    const handleModeChange = useCallback((mode: string) => {
        setIsAutomatic(mode === 'automatic');
        setIsPlaying(false);
    }, []);

    const handleCloseSuccessPopup = useCallback(() => {
        setShowSuccessPopup(false);
    }, []);

    const handleOrderChange = useCallback((newOrder: OrderType) => {
        setOrder(newOrder);
        setCurrentStep(-1);
        setIsPlaying(false);
    }, []);

    return (
        <>
            <div className="tree-mode-visualization-panel">
                <div className="tree-mode-controls">
                    {algo === 'exchange-property' && (
                        <div className="tree-mode-order-selector">
                            <label>Ordre de tri :</label>
                            <button
                                className={`arbre-couvrant-btn ${order === 'CROISSANT' ? 'active' : ''}`}
                                onClick={() => handleOrderChange('CROISSANT')}
                            >
                                Croissant
                            </button>
                            <button
                                className={`arbre-couvrant-btn ${order === 'DECROISSANT' ? 'active' : ''}`}
                                onClick={() => handleOrderChange('DECROISSANT')}
                            >
                                Décroissant
                            </button>
                            <button
                                className={`arbre-couvrant-btn ${order === 'ALEATOIRE' ? 'active' : ''}`}
                                onClick={() => handleOrderChange('ALEATOIRE')}
                            >
                                Aléatoire
                            </button>
                        </div>
                    )}
                    <div className="arbre-couvrant-selector">
                        <button
                            className={`arbre-couvrant-btn ${!isAutomatic ? 'active' : ''}`}
                            onClick={() => handleModeChange('manual')}
                        >
                            Mode Manuel
                        </button>
                        <button
                            className={`arbre-couvrant-btn ${isAutomatic ? 'active' : ''}`}
                            onClick={() => handleModeChange('automatic')}
                        >
                            Mode Automatique
                        </button>
                    </div>
                    {!isAutomatic ? (
                        <div className="tree-mode-step-controls">
                            <button
                                className="arbre-couvrant-btn"
                                onClick={handlePreviousStep}
                                disabled={currentStep <= 0}
                            >
                                ← Précédent
                            </button>
                            <button
                                className="arbre-couvrant-btn"
                                onClick={handleReset}
                                disabled={currentStep === -1}
                            >
                                Réinitialiser
                            </button>
                            <button
                                className="arbre-couvrant-btn"
                                onClick={handleNextStep}
                                disabled={currentStep === steps.length - 1}
                            >
                                Suivant →
                            </button>
                        </div>
                    ) : (
                        <div className="tree-mode-speed-controls">
                            <button
                                className={`arbre-couvrant-btn ${isPlaying ? 'pause' : 'play'} arbre-couvrant-btn-playpause`}
                                onClick={handlePlayPause}
                            >
                                {isPlaying ? '⏸️ Pause' : '▶️ Démarrer'}
                            </button>
                            <button 
                                className="arbre-couvrant-btn speed-control-btn" 
                                onClick={handleSpeedDown} 
                                title="Ralentir"
                                disabled={speed === 2000}
                            >
                                ⏪
                            </button>
                            <div className="tree-mode-speed-display">
                                {speed === 2000 ? '0.5x' : speed === 1000 ? '1x' : '2x'}
                            </div>
                            <button 
                                className="arbre-couvrant-btn speed-control-btn" 
                                onClick={handleSpeedUp} 
                                title="Accélérer"
                                disabled={speed === 500}
                            >
                                ⏩
                            </button>
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