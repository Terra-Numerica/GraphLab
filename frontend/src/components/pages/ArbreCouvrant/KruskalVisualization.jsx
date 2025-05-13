import React, { useState, useCallback, useEffect } from 'react';
import { UnionFind, kruskalAlgorithm } from '../../../utils/kruskalUtils';
import '../../../styles/pages/ArbreCouvrant/KruskalVisualization.css';

const KruskalVisualization = ({ graph, cyRef }) => {
    const [isAutomatic, setIsAutomatic] = useState(false);
    const [speed, setSpeed] = useState(1000); // ms between steps
    const [currentStep, setCurrentStep] = useState(-1);
    const [steps, setSteps] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [explanation, setExplanation] = useState('');

    // Initialize steps when component mounts
    useEffect(() => {
        if (!graph) return;

        const initializeSteps = () => {
            const nodeCount = graph.data.nodes.length;
            const uf = new UnionFind(nodeCount);
            const nodeToIndex = {};
            const newSteps = [];

            // Create a mapping from node IDs to indices
            graph.data.nodes.forEach((node, index) => {
                nodeToIndex[node.data.id] = index;
            });

            // Sort edges by weight
            const sortedEdges = [...graph.data.edges].sort((a, b) => a.data.weight - b.data.weight);

            for (const edge of sortedEdges) {
                const sourceIndex = nodeToIndex[edge.data.source];
                const targetIndex = nodeToIndex[edge.data.target];

                if (uf.find(sourceIndex) !== uf.find(targetIndex)) {
                    newSteps.push({
                        edge,
                        action: 'add',
                        explanation: `Ajout de l'arête ${edge.data.source}-${edge.data.target} (poids: ${edge.data.weight}) car elle ne crée pas de cycle`
                    });
                    uf.union(sourceIndex, targetIndex);
                } else {
                    newSteps.push({
                        edge,
                        action: 'skip',
                        explanation: `Saut de l'arête ${edge.data.source}-${edge.data.target} (poids: ${edge.data.weight}) car elle créerait un cycle`
                    });
                }
            }

            setSteps(newSteps);
            setExplanation('Cliquez sur "Étape suivante" ou "Démarrer" pour commencer la visualisation');
        };

        initializeSteps();
    }, [graph]);

    // Handle automatic mode
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

    // Update visualization when step changes
    useEffect(() => {
        if (!cyRef.current || steps.length === 0) return;

        // Reset all edges
        cyRef.current.edges().removeClass('selected skipped')
            .style({
                'line-color': '#666',
                'line-width': 1,
                'opacity': 1
            });

        // Color all edges up to currentStep (si currentStep >= 0)
        if (currentStep >= 0) {
            for (let i = 0; i <= currentStep; i++) {
                const step = steps[i];
                const edge = cyRef.current.getElementById(step.edge.data.id);
                if (edge) {
                    if (step.action === 'add') {
                        edge.addClass('selected')
                            .style({
                                'line-color': '#2ecc71',
                                'line-width': 3,
                                'opacity': 1
                            });
                    } else if (step.action === 'skip') {
                        edge.addClass('skipped')
                            .style({
                                'line-color': '#e74c3c',
                                'line-width': 2,
                                'opacity': 0.5
                            });
                    }
                }
            }
        }

        // Explication de l'étape courante
        if (currentStep >= 0 && steps[currentStep]) {
            setExplanation(steps[currentStep].explanation);
        } else {
            setExplanation('');
        }
    }, [currentStep, steps, cyRef]);

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
            // Si on est à la dernière étape, on reset et on relance
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

                {/* Contrôles selon le mode */}
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

export default KruskalVisualization; 