// Imports
import ValidationPopup from '../../common/ValidationPopup';
import TimerDisplay from '../../common/TimerDisplay';
import RulesPopup from '../../common/RulesPopup';
import GraphDisplay from './GraphDisplay';

import { useFetchGraphs, useFetchGraph } from '../../../hooks/useFetchGraphs';
import { useState, useEffect, useRef } from 'react';
import { useTimer } from '../../../hooks/useTimer';
import { useNavigate } from 'react-router-dom';

const Libre = () => {
    const [graphs, setGraphs] = useState({
        tresFacile: [],
        facile: [],
        moyen: [],
        difficile: [],
        extreme: [],
    });
    const [selectedGraph, setSelectedGraph] = useState('');
    const [currentGraph, setCurrentGraph] = useState(null);
    const [validationPopup, setValidationPopup] = useState(null);
    const cyRef = useRef(null);
    const [showRules, setShowRules] = useState(false);
    const { time, start, stop, reset, formatTime, isRunning } = useTimer();
    const navigate = useNavigate();

    const { graphs: fetchedGraphs, loading: graphsLoading, error } = useFetchGraphs();
    const { graph: selectedGraphData, loading: graphLoading } = useFetchGraph({ id: selectedGraph });

    useEffect(() => {
        if (fetchedGraphs.length > 0) {
            const sortedGraphs = {
                tresFacile: [],
                facile: [],
                moyen: [],
                difficile: [],
                extreme: [],
            };

            const coloringWorkshops = fetchedGraphs.filter((graph) => graph.workshopData.coloring.enabled);

            coloringWorkshops.forEach((graph) => {
                const difficulty = graph.workshopData.coloring.difficulty;

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
                optimalCount: graphConfig.workshopData.coloring.optimalCount,
                tabletCounts: graphConfig.workshopData.coloring.tabletCounts,
                difficulty: graphConfig.workshopData.coloring.difficulty,
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
        extreme: 'Extrême',
    };

    function handleGraphSelect(event) {
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

        const optimalColorCount = currentGraph.optimalCount;

        if (!isCompleted) {
            setValidationPopup({
                type: 'warning',
                title: 'Attention !',
                message: "Le graphe n'est pas entièrement coloré.",
            });
        } else if (!isValid) {
            setValidationPopup({
                type: 'error',
                title: 'Erreur !',
                message: 'Deux sommets adjacents ont la même couleur.',
            });
        } else {
            if (usedColors.size > optimalColorCount) {
                setValidationPopup({
                    type: 'success',
                    title: 'Félicitations !',
                    message:
                        'Tu as réussi à colorer le graphe ! Il existe une solution qui utilise moins de couleurs. Peux-tu la trouver ?',
                });
            } else {
                stop();
                setValidationPopup({
                    type: 'success',
                    title: 'Félicitations !',
                    message: `Tu as réussi à colorer le graphe en ${formatTime(
                        time
                    )} ! Tu as trouvé la solution qui utilise le nombre minimum de couleurs !`,
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
                <h2 className="mt-4 text-center text-3xl md:text-4xl font-bold text-darkBlue">Mode Libre</h2>

                {/* Top bar */}
                <div className="mt-6 flex flex-col items-stretch gap-3 rounded-2xl bg-white p-4 shadow md:flex-row md:items-center md:justify-between">
                    <div className="flex w-64 items-center gap-3 md:max-w-xl">
                        <select
                            id="graph-select"
                            className="w-full rounded-xl border border-grey bg-white px-3 py-2 text-astro shadow-sm focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
                            value={selectedGraph}
                            onChange={handleGraphSelect}
                            disabled={graphsLoading}
                        >
                            <option value="" disabled hidden>
                                {graphsLoading ? 'Chargement des graphes...' : 'Choisis un graphe'}
                            </option>
                            {Object.entries(graphs).map(([difficulty, graphList]) =>
                                graphList.length > 0 ? (
                                    <optgroup key={difficulty} label={difficultyLabels[difficulty]}>
                                        {graphList.map((graph) => (
                                            <option key={graph._id} value={graph._id}>
                                                {graph.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                ) : null
                            )}
                        </select>
                    </div>

                    <div className="flex items-center justify-end">
                        {currentGraph && <TimerDisplay time={time} formatTime={formatTime} />}
                    </div>
                </div>

                <div className="mt-6">
                        {error && <div className="rounded-lg bg-red/10 px-3 py-2 text-sm font-medium text-red">{error}</div>}
                </div>

                {/* Action buttons (only if a graph is loaded) */}
                {currentGraph && !graphLoading && (
                    <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-green px-5 py-2.5 text-sm font-semibold text-green hover:bg-green hover:text-white transition focus:outline-none focus:ring-2 focus:ring-green/40"
                            onClick={validateGraph}
                        >
                            Valider la coloration
                        </button>
                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-red px-5 py-2.5 text-sm font-semibold text-red hover:bg-red hover:text-white transition focus:outline-none focus:ring-2 focus:ring-red/40"
                            onClick={resetColors}
                        >
                            Réinitialiser la coloration
                        </button>
                    </div>
                )}

                {/* Graph area */}
                {currentGraph && !graphLoading && (
                    <div className="mt-6 overflow-hidden rounded-2xl bg-white p-3 shadow">
                        <GraphDisplay graphData={currentGraph} cyRef={cyRef} modeLibre={true} />
                    </div>
                )}
            </div>

            {/* Floating rules button */}
            <button
                className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-green px-5 py-3 text-base font-bold text-white shadow-xl hover:bg-green-hover hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green/40 transition-all duration-200"
                onClick={() => setShowRules(true)}
                aria-label="Voir les règles"
            >
                ℹ️ Voir les règles
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
                <RulesPopup title="Règles du mode Libre" onClose={() => setShowRules(false)}>
                    <h3>🎯 Objectif</h3>
                    <ul className="list-disc pl-5">
                        <li>Deux sommets adjacents ne doivent jamais avoir la même couleur.</li>
                        <li>Tu disposes d'un nombre illimité de pastilles que tu dois placer correctement.</li>
                    </ul>

                    <h3 className="mt-4">🛠️ Comment jouer à la <strong>Coloration d'un Graphe</strong></h3>
                    <ul className="list-disc pl-5">
                        <li>Choisis un graphe prédéfini dans le menu déroulant.</li>
                        <li>Attrape une pastille de couleur, fais-la glisser vers un sommet et relâche-la pour lui attribuer cette couleur.</li>
                        <li>Colorie entièrement le graphe en respectant les règles de coloration.</li>
                        <li>
                            Quand tu penses avoir réussi, clique sur le bouton <strong>Valider la Coloration</strong> pour vérifier si le
                            graphe est correctement coloré.
                        </li>
                        <li>Mets-toi au défi d'utiliser le moins de couleurs possible pour colorer le graphe !</li>
                    </ul>

                    <h3 className="mt-4">🔧 Fonctionnalités</h3>
                    <ul className="list-disc pl-5">
                        <li>Si tu penses avoir fait une erreur, tu peux faire un clic droit sur un sommet pour lui retirer sa couleur.</li>
                        <li>
                            Si tu veux recommencer, clique sur <strong>Réinitialiser la Coloration</strong> pour remettre tous les sommets
                            dans leur état initial.
                        </li>
                    </ul>
                </RulesPopup>
            )}
        </div>
    );
};

export default Libre;