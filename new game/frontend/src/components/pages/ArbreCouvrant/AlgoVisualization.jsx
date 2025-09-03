import { kruskalAlgorithm } from '../../../utils/kruskalUtils';
import { boruvkaAlgorithm } from '../../../utils/boruvkaUtils';
import { primAlgorithm } from '../../../utils/primUtils';
import { useState, useCallback, useEffect } from 'react';

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
        cyRef.current.edges().removeClass('algo-edge-selected algo-prim-selected algo-kruskal-selected algo-boruvka-selected algo-boruvka-min-edge')
            .style({
                'line-color': '#666',
                'line-width': 1,
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
                if (step.edge) {
                    const edge = cyRef.current.getElementById(step.edge.data.id);
                    if (edge) {
                        if (algo === 'boruvka' && step.action === 'min_edge') {
                            edge.addClass(config.minEdgeClass);
                        } else {
                            edge.addClass(config.edgeClass);
                        }
                        edge.style({
                            'line-color': '#2ecc71',
                            'line-width': 3,
                            'opacity': 1
                        });
                    }
                }
                if (algo === 'prim' && step.action === 'start' && step.node) {
                    const node = cyRef.current.getElementById(step.node);
                    if (node) {
                        node.addClass(config.nodeStartClass);
                    }
                }
                if (algo === 'boruvka' && step.action === 'start') {
                    cyRef.current.nodes().addClass(config.componentClass);
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