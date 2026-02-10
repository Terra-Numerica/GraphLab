import { rgbToHex } from '../../../utils/colorUtils';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import ValidationPopup from '../../common/ValidationPopup';
import TimerDisplay from '../../common/TimerDisplay';
import RulesPopup from '../../common/RulesPopup';
import GraphDisplay from './GraphDisplay';

import { useFetchGraphs, useFetchGraph } from '../../../hooks/useFetchGraphs';
import { useTimer } from '../../../hooks/useTimer';

// ❌ supprimé : import '../../../styles/pages/Coloration/ColorationStyles.css';

const Defi = () => {
    const [graphs, setGraphs] = useState({
        tresFacile: [],
        facile: [],
        moyen: [],
        difficile: [],
        extreme: []
    });
    const [selectedGraph, setSelectedGraph] = useState('');
    const [currentGraph, setCurrentGraph] = useState(null);
    const [validationPopup, setValidationPopup] = useState(null);
    const [isImpossibleEnabled, setIsImpossibleEnabled] = useState(false);
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
                extreme: []
            };

            const coloringWorkshops = fetchedGraphs.filter((graph) => graph.workshopData.coloring.enabled);

            coloringWorkshops.forEach(graph => {
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

            graphConfig.data.nodes.forEach(node => {
                if (node.position) {
                    node.position.y += 80;
                }
            });

            graphConfig.data.edges.forEach(edge => {
                if (edge.data) {
                    edge.data.controlPointDistance = edge.data.controlPointDistance ?? 0;
                }
            });

            setCurrentGraph({
                name: graphConfig.name,
                data: graphConfig.data,
                optimalCount: graphConfig.workshopData.coloring.optimalCount,
                tabletCounts: graphConfig.workshopData.coloring.tabletCounts,
                difficulty: graphConfig.workshopData.coloring.difficulty
            });
            reset();
            start();
        }
    }, [selectedGraphData]);

    useEffect(() => {
        if (cyRef.current) {
            cyRef.current.on('style', checkColoredPercentage);
            return () => {
                cyRef.current.off('style', checkColoredPercentage);
            };
        }
    }, [cyRef.current]);

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

    function handleGraphSelect(event) {
        const graphId = event.target.value;
        setSelectedGraph(graphId);
        setIsImpossibleEnabled(false);

        if (!graphId) {
            setCurrentGraph(null);
            reset();
        }
    }

    function checkColoredPercentage() {
        if (!cyRef.current) return;

        const totalNodes = cyRef.current.nodes().filter(node => !node.data('isColorNode')).length;
        const coloredNodes = cyRef.current.nodes().filter(node => {
            return !node.data('isColorNode') && node.data('color') !== '#CCCCCC';
        }).length;

        const percentage = (coloredNodes / totalNodes) * 100;
        setIsImpossibleEnabled(percentage >= 15);
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
                message: "Le graphe n'est pas entièrement coloré."
            });
        } else if (!isValid) {
            setValidationPopup({
                type: 'error',
                title: 'Erreur !',
                message: 'Deux sommets adjacents ont la même couleur.'
            });
        } else {
            if (usedColors.size > optimalColorCount) {
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

        const colorCounts = {};
        const unusedColors = {};
        const defaultColor = '#CCCCCC';

        cyRef.current.nodes().forEach((node) => {
            if (!node.data('isColorNode')) {
                const currentColor = node.data('color');
                if (currentColor && currentColor !== defaultColor) {
                    colorCounts[currentColor] = (colorCounts[currentColor] || 0) + 1;
                }
                node.data('color', defaultColor);
            } else {
                const color = node.data('color');
                unusedColors[color] = (unusedColors[color] || 0) + 1;
            }
        });

        cyRef.current.nodes().filter(node => node.data('isColorNode')).forEach(node => cyRef.current.remove(node));

        let currentXPosition = 50;

        const allColors = { ...colorCounts };

        Object.entries(unusedColors).forEach(([color, count]) => {
            allColors[color] = (allColors[color] || 0) + count;
        });

        Object.entries(allColors).forEach(([color, count]) => {
            for (let i = 0; i < count; i++) {
                cyRef.current.add({
                    group: 'nodes',
                    data: {
                        id: `color-${color}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                        isColorNode: true,
                        color: color
                    },
                    position: { x: currentXPosition, y: 50 },
                    locked: false
                });
                currentXPosition += 50;
            }
        });

        if (!isRunning) {
            reset();
            start();
        }
    }

    function handleImpossible() {
        if (!cyRef.current || !currentGraph) return;

        const totalNodes = cyRef.current.nodes().filter(node => !node.data('isColorNode')).length;
        const coloredNodes = cyRef.current.nodes().filter(node => {
            return !node.data('isColorNode') && rgbToHex(node.style('background-color')) !== '#CCCCCC';
        }).length;

        const percentage = (coloredNodes / totalNodes) * 100;

        if (percentage < 15) {
            setValidationPopup({
                type: 'warning',
                title: 'Attention !',
                message: "Tu dois essayer de colorer au moins 15% du graphe avant de déclarer qu'il est impossible !"
            });
            return;
        }

        const difficulty = currentGraph.difficulty.toLowerCase();
        const graphName = currentGraph.name;
        const gameNumber = parseInt(graphName.split(' ')[1]);

        if (difficulty.includes('impossible-preuve')) {
            let explanation = "";

            switch (gameNumber) {
                case 12:
                    explanation = "Pour ce graphe, nous avons deux couleurs à disposition (rouge et bleu). Mais, on ne peut pas colorer ce graphe avec deux couleurs. En effet, ce graphe possède deux cycles impairs (i.e. avec un nombre impair de sommets) : celui formé par les sommets en vert clair, et celui formé par les sommets en jaune dans la figure ci-contre. En effet, sur un cycle impair, il est impossible de faire alterner deux couleurs.";
                    break;
                case 13:
                    explanation = "Observons que les trois sommets d'un triangle doivent être de couleurs différentes. Ainsi chacune des trois couleurs apparaît sur chaque triangle. Supposons que ce soit possible de colorer avec les jetons fournis. abc, efh et ihk sont des triangles. Comme on ne dispose que de deux jetons jaunes, l'un d'entre eux doit forcément être sur h, le seul sommet qui soit dans deux de ces triangles. De même, abc et bcf sont des triangles, donc le deuxième jeton jaune doit être sur b, le sommet commun à ces deux triangles. Une fois placés les deux jetons jaunes, il ne reste que deux couleurs. On peut bien colorer le graphe restant avec deux couleurs. Cependant une telle coloration est fixée à permutation des couleurs près. En effet, une fois que la couleur d'un sommet est fixée, celle de ses voisins doit être différente, celles des voisins de ses voisins la même et ainsi de suite. Ainsi une coloration en deux couleurs de ce graphe a forcément 5 sommets d'une couleur (ceux en gris dans la figure ci-dessus) et 8 de l'autre (ceux en blanc). Or ici nous disposons de 6 jetons rouges et 7 jetons bleus.";
                    break;
                case 16:
                    explanation = "Pour ce graphe, nous avons un seul jeton de couleur jaune. Celui-ci doit forcément être au sommet central qui est relié à tous les autres. Il reste ensuite les deux couleurs, rouge et bleu, pour colorer le cycle externe. Mais, cela est impossible car ce cycle est impair (il a 9 sommets), et qu'on ne peut donc pas faire alterner deux couleurs sur ce cycle.";
                    break;
                case 22:
                    explanation = "Ce graphe possède 4 triangles disjoints représentés en vert sur la figure ci-contre. Comme on ne dispose que de trois couleurs de jetons, chacun de ces triangles doit avoir un sommet de chaque couleur. Il faudrait donc au moins quatre jetons de chaque couleur pour avoir une solution, mais nous ne disposons que de trois jetons bleus.";
                    break;
                case 25:
                    explanation = "Dans ce problème, nous disposons de 6 jetons rouges. Il faut pouvoir placer ces jetons sur un ensemble indépendant du graphe, c'est-à-dire un ensemble dont aucune paire n'est reliée par une arête. Montrons que ceci est impossible. On peut tout d'abord facilement voir qu'aucun des deux sommets en gris sur la figure ci-contre ne peut être dans un tel ensemble indépendant car ils ont trop de voisins. Les sommets non-gris forment un enchaînement de dix sommets sur lesquels il est impossible de mettre 6 jetons rouges. En effet, deux sommets consécutifs ne peuvent pas être rouge, donc on peut placer les jetons rouges au mieux un sommet sur deux, soit 5 fois.";
                    break;
                case 38:
                    explanation = "Pour ce graphe, nous avons deux couleurs à disposition (rouge et bleu). On peut bien colorer ce graphe avec deux couleurs (voir la solution au problème 37). Cependant une telle coloration est fixée à permutation des couleurs près. En effet, une fois que la couleur d'un sommet est fixée, celle de ses voisins doit être différente, celles des voisins de ses voisins la même et ainsi de suite. Ainsi une coloration en deux couleurs de ce graphe a forcément 6 sommets d'une couleur et 4 de l'autre. Or ici nous disposons de 5 jetons de chaque couleur.";
                    break;
                case 39:
                    explanation = "Pour ce graphe, nous avons deux couleurs à disposition (rouge et bleu). Mais, on ne peut pas colorer ce graphe avec deux couleurs. En effet, ce graphe possède des cycles impairs (i.e. avec un nombre impair de sommets). Par exemple, celui formé par les sommets en vert clair dans la figure ci-contre. En effet, sur un cycle impair, il est impossible de faire alterner deux couleurs.";
                    break;
                default:
                    explanation = difficulty === "impossible-preuve-facile"
                        ? "En essayant le graphe, vous venez de comprendre pourquoi il est dans la catégorie moyenne."
                        : "En essayant le graphe, vous venez de comprendre pourquoi il est dans la catégorie extrême.";
            }

            stop();
            setValidationPopup({
                type: 'success',
                title: 'Bonne analyse !',
                message: `${explanation} \n Temps: ${formatTime(time)}`
            });
        } else {
            setValidationPopup({
                type: 'error',
                title: "Non, ce graphe n'est pas impossible.",
                message: "Ce graphe peut être coloré correctement. Essaie encore !"
            });
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
                <h2 className="mt-4 text-center text-3xl md:text-4xl font-bold text-darkBlue">Mode Défi</h2>

                {/* Top bar */}
                <div className="mt-6 flex flex-col items-stretch gap-3 rounded-2xl bg-white p-4 shadow md:flex-row md:items-center md:justify-between">
                    <div className="flex w-64 items-center gap-3 md:max-w-xl">
                        <select
                            className="w-full rounded-xl border border-grey bg-white px-3 py-2 text-astro shadow-sm focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30"
                            value={selectedGraph}
                            onChange={handleGraphSelect}
                            disabled={graphsLoading}
                        >
                            <option value="" disabled hidden>
                                {graphsLoading ? "Chargement des graphes..." : "Choisis un graphe"}
                            </option>
                            {Object.entries(graphs).map(([difficulty, graphList]) => (
                                graphList.length > 0 && (
                                    <optgroup key={difficulty} label={difficultyLabels[difficulty]}>
                                        {graphList.map((graph) => (
                                            <option key={graph._id} value={graph._id}>
                                                {graph.name}
                                            </option>
                                        ))}
                                    </optgroup>
                                )
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        {error && (
                            <div className="rounded-lg bg-red/10 px-3 py-2 text-sm font-medium text-red">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end">
                        {currentGraph && <TimerDisplay time={time} formatTime={formatTime} />}
                    </div>
                </div>

                {/* Buttons row */}
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
                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-orange-500 px-5 py-2.5 text-sm font-semibold text-orange-600 hover:bg-orange-500 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-orange-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleImpossible}
                            disabled={!isImpossibleEnabled}
                        >
                            Je pense qu'il est impossible
                        </button>
                    </div>
                )}

                {/* Graph area */}
                {currentGraph && !graphLoading && (
                    <div className="mt-6 overflow-hidden rounded-2xl bg-white p-3 shadow">
                        <GraphDisplay graphData={currentGraph} cyRef={cyRef} />
                    </div>
                )}
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
                <RulesPopup title="Règles du mode Défi" onClose={() => setShowRules(false)}>
                    <h3>🎯 Objectif</h3>
                    <ul className="list-disc pl-5">
                        <li>Deux sommets adjacents ne doivent jamais avoir la même couleur.</li>
                        <li>Tu disposes d'un nombre limité de pastilles que tu dois placer correctement.</li>
                    </ul>

                    <h3 className="mt-4">🛠️ Comment jouer à la <strong>Coloration d'un Graphe</strong></h3>
                    <ul className="list-disc pl-5">
                        <li>Choisis un graphe prédéfini dans le menu déroulant.</li>
                        <li>Attrape une pastille de couleur, fais-la glisser vers un sommet et relâche-la pour lui attribuer cette couleur.</li>
                        <li>Colorie entièrement le graphe en respectant les règles de coloration.</li>
                        <li>Quand tu penses avoir réussi, clique sur le bouton <strong>Valider la Coloration</strong> pour vérifier si le graphe est correctement coloré.</li>
                    </ul>

                    <h3 className="mt-4">🔧 Fonctionnalités</h3>
                    <ul className="list-disc pl-5">
                        <li>Si tu penses avoir fait une erreur, tu peux faire un clic droit sur un sommet pour lui retirer sa couleur.</li>
                        <li>Si tu veux recommencer, clique sur <strong>Réinitialiser la Coloration</strong> pour remettre tous les sommets dans leur état initial.</li>
                    </ul>
                </RulesPopup>
            )}
        </div>
    );
};

export default Defi;