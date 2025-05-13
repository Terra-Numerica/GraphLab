import React, { useState, useCallback, useEffect } from 'react';
import { boruvkaAlgorithm } from '../../../utils/boruvkaUtils';
import '../../../styles/pages/ArbreCouvrant/BoruvkaVisualization.css';

const BoruvkaVisualization = ({ graph, cyRef }) => {
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
            const newSteps = boruvkaAlgorithm(graph.data.nodes, graph.data.edges);
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

        // Reset all edges and nodes
        cyRef.current.edges().removeClass('selected boruvka-min-edge')
            .style({
                'line-color': '#666',
                'line-width': 1,
                'opacity': 1
            });

        // Color all edges and nodes up to currentStep
        if (currentStep >= 0) {
            for (let i = 0; i <= currentStep; i++) {
                const step = steps[i];
                if (step.edge) {
                    const edge = cyRef.current.getElementById(step.edge.data.id);
                    if (edge) {
                        edge.addClass('selected')
                            .style({
                                'line-color': '#2ecc71',
                                'line-width': 3,
                                'opacity': 1
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

export default BoruvkaVisualization; 