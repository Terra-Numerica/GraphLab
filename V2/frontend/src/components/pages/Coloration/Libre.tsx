// Imports
import ValidationPopup from '../../common/ValidationPopup';
import TimerDisplay from '../../common/TimerDisplay';
import RulesPopup from '../../common/RulesPopup';
import GraphDisplay from './GraphDisplay';

import { useFetchGraphs, useFetchGraph } from '../../../hooks/useFetchGraphs';
import { useState, useEffect, useRef } from 'react';
import { useTimer } from '../../../hooks/useTimer';
import { useNavigate } from 'react-router-dom';
import { Graph } from '../../../types';

import '../../../styles/pages/Coloration/ColorationStyles.css';

const Libre: React.FC = () => {

    const [graphs, setGraphs] = useState<{
        tresFacile: Graph[];
        facile: Graph[];
        moyen: Graph[];
        difficile: Graph[];
        extreme: Graph[];
    }>({
        tresFacile: [],
        facile: [],
        moyen: [],
        difficile: [],
        extreme: []
    });
    const [selectedGraph, setSelectedGraph] = useState('');
    const [currentGraph, setCurrentGraph] = useState<{
        name: string;
        data: any;
        optimalCount?: number;
        tabletCounts?: Record<string, number>;
        difficulty?: string;
    } | null>(null);
    const [validationPopup, setValidationPopup] = useState<{
        type: 'warning' | 'error' | 'success';
        title: string;
        message: string;
    } | null>(null);
    const cyRef = useRef<cytoscape.Core | null>(null);
    const [showRules, setShowRules] = useState<boolean>(false);
    const { time, start, stop, reset, formatTime, isRunning } = useTimer();
    const navigate = useNavigate();

    const { graphs: fetchedGraphs, loading: graphsLoading, error } = useFetchGraphs();
    const { graph: selectedGraphData, loading: graphLoading } = useFetchGraph({ id: selectedGraph });

    useEffect(() => {
        if (fetchedGraphs.length > 0) {
            const sortedGraphs: {
                tresFacile: Graph[];
                facile: Graph[];
                moyen: Graph[];
                difficile: Graph[];
                extreme: Graph[];
            } = {
                tresFacile: [],
                facile: [],
                moyen: [],
                difficile: [],
                extreme: []
            };

            const coloringWorkshops = fetchedGraphs.filter((graph) => graph.workshopData.coloring?.enabled);

            coloringWorkshops.forEach((graph: Graph) => {
                const difficulty = graph.workshopData.coloring?.difficulty;

                switch (difficulty) {
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
                    case 'Impossible-preuve-facile':
                        sortedGraphs.moyen.push(graph);
                        break;
                    case 'Impossible-preuve-difficile':
                        sortedGraphs.extreme.push(graph);
                        break;
                    default:
                        sortedGraphs.facile.push(graph);
                }
            });
            setGraphs(sortedGraphs);
        }
    }, [fetchedGraphs]);

    useEffect(() => {
        if (selectedGraphData?.data) {
            const graphConfig = selectedGraphData;

            graphConfig.data.nodes.forEach((node) => {
                if (node.position) {
                    node.position.y += 80;
                }
            });
            graphConfig.data.edges.forEach((edge) => {
                if (edge.data) {
                    edge.data.controlPointDistance = edge.data.controlPointDistance ?? 0;
                }
            });
            setCurrentGraph({
                name: graphConfig.name,
                data: graphConfig.data,
                optimalCount: graphConfig.workshopData.coloring?.optimalCount,
                tabletCounts: graphConfig.workshopData.coloring?.tabletCounts,
                difficulty: graphConfig.workshopData.coloring?.difficulty
            });
            reset();
            start();
        }
    }, [selectedGraphData]);

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

    function handleGraphSelect(event: React.ChangeEvent<HTMLSelectElement>) {
        const graphId = event.target.value;
        setSelectedGraph(graphId);
        if (!graphId) {
            setCurrentGraph(null);
            reset();
        }
    }

    function validateGraph() {
        if (!cyRef.current) return;

        const defaultColor = '#CCCCCC';
        let isCompleted = true;
        let isValid = true;
        const usedColors = new Set();

        cyRef.current.nodes().forEach((node) => {
            if (node.data('isColorNode')) return;

            const nodeColor = node.data('color') || defaultColor;

            if (nodeColor === defaultColor) {
                isCompleted = false;
            } else {
                usedColors.add(nodeColor);
            }

            node.connectedEdges().forEach((edge) => {
                const neighbor = edge.source().id() === node.id() ? edge.target() : edge.source();
                if (!neighbor.data('isColorNode') && neighbor.data('color') === nodeColor) {
                    isValid = false;
                }
            });
        });

        const optimalColorCount = currentGraph?.optimalCount;

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
            if (optimalColorCount && usedColors.size > optimalColorCount) {
                setValidationPopup({
                    type: 'success',
                    title: 'Félicitations !',
                    message: `Tu as réussi à colorer le graphe ! Il existe une solution qui utilise moins de couleurs. Peux-tu la trouver ?`
                });
            } else {
                stop();
                setValidationPopup({
                    type: 'success',
                    title: 'Félicitations !',
                    message: `Tu as réussi à colorer le graphe en ${formatTime(time)} ! Tu as trouvé la solution qui utilise le nombre minimum de couleurs !`
                });
            }
        }
    }

    function resetColors() {
        if (!cyRef.current) return;
        const defaultColor = '#CCCCCC';
        cyRef.current.nodes().forEach((node) => {
            if (!node.data('isColorNode')) {
                node.data('color', defaultColor);
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

    return (
        <div className="workshop-container">
            <button className="workshop-back-btn" onClick={() => navigate('/coloration')}>&larr; Retour</button>
            <h2 className="workshop-title">Mode Libre</h2>
            <div className="workshop-top-bar">
                <select
                    className="workshop-select"
                    value={selectedGraph}
                    onChange={handleGraphSelect}
                    disabled={graphsLoading}
                >
                    <option value="" disabled hidden>
                        {graphsLoading ? "Chargement des graphes..." : "Choisis un graphe"}
                    </option>
                    {Object.entries(graphs).map(([difficulty, graphList]) => (
                        graphList.length > 0 && (
                            <optgroup key={difficulty} label={difficultyLabels[difficulty as keyof typeof difficultyLabels]}>
                                {graphList.map((graph: Graph) => (
                                    <option key={graph._id} value={graph._id}>
                                        {graph.name}
                                    </option>
                                ))}
                            </optgroup>
                        )
                    ))}
                </select>
                {error && <div className="workshop-error-message">{error}</div>}
                {currentGraph && <TimerDisplay time={time} formatTime={formatTime} />}
            </div>
            {currentGraph && !graphLoading && <div className="workshop-buttons-row">
                <button className="workshop-btn workshop-btn-validate" onClick={validateGraph}>Valider la coloration</button>
                <button className="workshop-btn workshop-btn-reset" onClick={resetColors}>Réinitialiser la coloration</button>
            </div>}
            {currentGraph && !graphLoading && <GraphDisplay graphData={currentGraph} cyRef={cyRef} />}
            <button className="workshop-rules-btn" onClick={() => setShowRules(true)}>&#9432; Voir les règles</button>
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
                        <li>Tu disposes d'un nombre illimité de pastilles que tu dois placer correctement.</li>
                    </ul>

                    <h3>🛠️ Comment jouer à la <strong>Coloration d'un Graphe</strong></h3>
                    <ul>
                        <li>Choisis un graphe prédéfini dans le menu déroulant.</li>
                        <li>Attrape une pastille de couleur, fais-la glisser vers un sommet et relâche-la pour lui attribuer cette couleur.</li>
                        <li>Colorie entièrement le graphe en respectant les règles de coloration.</li>
                        <li>Quand tu penses avoir réussi, clique sur le bouton <strong>Valider la Coloration</strong> pour vérifier si le graphe est correctement coloré.</li>
                        <li>Mets-toi au défi d'utiliser le moins de couleurs possible pour colorer le graphe !</li>
                    </ul>

                    <h3>🔧 Fonctionnalités</h3>
                    <ul>
                        <li>Si tu penses avoir fait une erreur, tu peux faire un clic droit sur un sommet pour lui retirer sa couleur.</li>
                        <li>Si tu veux recommencer, clique sur <strong>Réinitialiser la Coloration</strong> pour remettre tous les sommets dans leur état initial.</li>
                    </ul>
                </RulesPopup>
            )}
        </div>
    );
};

export default Libre; 