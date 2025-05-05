import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GraphDisplay from './GraphDisplay';
import ValidationPopup from '../../common/ValidationPopup';
import RulesPopup from '../../common/RulesPopup';
import '../../../styles/pages/Coloration/GlobalMode.css';
import { rgbToHex } from '../../../utils/colorUtils';
import config from '../../../config';

const Defi = () => {
    // States
    const [graphs, setGraphs] = useState({
        tresFacile: [],
        facile: [],
        moyen: [],
        difficile: [],
        extreme: []
    });
    const [selectedGraph, setSelectedGraph] = useState('');
    const [currentGraph, setCurrentGraph] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationPopup, setValidationPopup] = useState(null);
    const [isImpossibleEnabled, setIsImpossibleEnabled] = useState(false);
    const cyRef = useRef(null);
    const { time, start, stop, reset, formatTime, isRunning } = useTimer();
    const [showRules, setShowRules] = useState(false);
    const navigate = useNavigate();

    // Effects
    useEffect(() => {
        fetchGraphs();
    }, []);

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

    // Constants
    const difficultyLabels = {
        tresFacile: 'Très Facile',
        facile: 'Facile',
        moyen: 'Moyen',
        difficile: 'Difficile',
        extreme: 'Extrême'
    };

    return (
        <div className="mode-container">
            <button className="mode-back-btn" onClick={() => navigate('/coloration')}>&larr; Retour</button>
            <h2 className="mode-title">Mode Défi</h2>
            <div className="mode-top-bar">
                <select
                    className="mode-select"
                    value={selectedGraph}
                    onChange={handleGraphSelect}
                    disabled={loading}
                >
                    <option value="" disabled hidden>
                        {loading ? "Chargement des graphes..." : "Veuillez choisir un graphe"}
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
                {error && <div className="error-message">{error}</div>}
                {currentGraph && <div className="mode-timer">Temps: {formatTime(time)}</div>}
            </div>
            {currentGraph && <div className="mode-buttons-row">
                <button className="mode-btn mode-btn-validate" onClick={validateGraph}>Valider la coloration</button>
                <button className="mode-btn mode-btn-reset" onClick={resetColors}>Réinitialiser la coloration</button>
                <button
                    className="mode-btn mode-btn-impossible"
                    onClick={handleImpossible}
                    disabled={!isImpossibleEnabled}
                >
                    Je pense qu'il est impossible
                </button>
            </div>}

            {currentGraph && <GraphDisplay graphData={currentGraph} cyRef={cyRef} />}

            <button className="mode-rules-btn" onClick={() => setShowRules(true)}>&#9432; Voir les règles</button>

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

                    <ul>
                        <li>Deux sommets adjacents ne doivent jamais avoir la même couleur.</li>
                        <li>Vous possédez un nombre limité de pastilles que vous devez placer correctement.</li>
                    </ul>

                    <h3>🛠️ Comment jouer à la <strong>Coloration d'un Graphe</strong></h3>
                    <ul>
                        <li>Sélectionnez un graphe prédéfini dans le menu déroulant.</li>
                        <li>Attrapez une pastille de couleur, faites-la glisser vers un sommet et relâchez-la pour lui attribuer cette couleur.</li>
                        <li>Coloriez entièrement le graphe en respectant les règles de coloration.</li>
                        <li>Quand vous pensez avoir réussi, cliquez sur le bouton <strong>Valider la Coloration</strong> pour vérifier si le graphe est correctement coloré.</li>
                    </ul>

                    <h3>🔧 Fonctionnalités</h3>
                    <ul>
                        <li>Si vous pensez avoir fait une erreur, vous pouvez faire un clic droit sur un sommet pour lui retirer sa couleur.</li>
                        <li>Si vous voulez recommencer, cliquez sur <strong>Réinitialiser la Coloration</strong> pour remettre tous les sommets dans leur état initial.</li>
                    </ul>
                </RulesPopup>
            )}
        </div>
    );

    // Functions
    function fetchGraphs() {
        const fetchData = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/graph`);
                if (!response.ok) {
                    throw new Error('Impossible de récupérer la liste des graphes');
                }
                const data = await response.json();

                const sortedGraphs = {
                    tresFacile: [],
                    facile: [],
                    moyen: [],
                    difficile: [],
                    extreme: []
                };

                data.forEach(graph => {
                    switch (graph.difficulty) {
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
                        case 'Extrême':
                            sortedGraphs.extreme.push(graph);
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
                setLoading(false);
            } catch (err) {
                setError('Impossible de récupérer la liste des graphes');
                setLoading(false);
            }
        };

        fetchData();
    }

    function handleGraphSelect(event) {
        const graphId = event.target.value;
        setSelectedGraph(graphId);
        setIsImpossibleEnabled(false);

        if (!graphId) {
            setCurrentGraph(null);
            reset();
            return;
        }

        const fetchGraph = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/graph/${graphId}`);
                if (!response.ok) {
                    throw new Error('Impossible de récupérer les détails du graphe');
                }
                const graphConfig = await response.json();

                if (graphConfig?.data) {
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
                        optimalColoring: graphConfig.optimalColoring,
                        pastilleCounts: graphConfig.pastilleCounts,
                        difficulty: graphConfig.difficulty
                    });
                    reset();
                    start();
                } else {
                    throw new Error('Données invalides pour le graphe');
                }
            } catch (err) {
                console.error('Erreur lors du chargement du graphe:', err);
                setError('Impossible de charger le graphe sélectionné');
                setCurrentGraph(null);
            }
        };

        fetchGraph();
    }

    function checkColoredPercentage() {
        if (!cyRef.current) return;

        const totalNodes = cyRef.current.nodes().filter(node => !node.data('isColorNode')).length;
        const coloredNodes = cyRef.current.nodes().filter(node => {
            return !node.data('isColorNode') && rgbToHex(node.style('background-color')) !== '#CCCCCC';
        }).length;

        const percentage = (coloredNodes / totalNodes) * 100;
        setIsImpossibleEnabled(percentage >= 15);
    }

    function validateGraph() {
        if (!cyRef.current) return;

        const defaultColor = '#CCCCCC';
        let isCompleted = true;
        let isValid = true;

        cyRef.current.nodes().forEach((node) => {
            const nodeColor = node.style('background-color');
            let hexNodeColor = '';

            if (nodeColor.startsWith('rgb')) {
                hexNodeColor = rgbToHex(nodeColor);
            }

            if (hexNodeColor === defaultColor) isCompleted = false;

            node.connectedEdges().forEach((edge) => {
                const neighbor = edge.source().id() === node.id() ? edge.target() : edge.source();
                if (neighbor.style('background-color') === nodeColor) {
                    isValid = false;
                }
            });
        });

        if (!isCompleted) {
            setValidationPopup({
                type: 'warning',
                title: 'Attention !',
                message: 'Le graphe n\'est pas entièrement coloré.'
            });
        } else if (!isValid) {
            setValidationPopup({
                type: 'error',
                title: 'Erreur !',
                message: 'Deux sommets adjacents ont la même couleur.'
            });
        } else {
            stop();
            setValidationPopup({
                type: 'success',
                title: 'Félicitations !',
                message: `Bravo ! La coloration est valide !\nTemps: ${formatTime(time)}`
            });
        }
    }

    function resetColors() {
        if (!cyRef.current) return;

        const colorCounts = {};
        const unusedColors = {};
        const defaultColor = '#CCCCCC';

        cyRef.current.nodes().forEach((node) => {
            if (!node.data('isColorNode')) {
                const currentColor = rgbToHex(node.style('background-color'));
                if (currentColor !== defaultColor) {
                    colorCounts[currentColor] = (colorCounts[currentColor] || 0) + 1;
                }
                node.style('background-color', defaultColor);
            } else {
                const color = rgbToHex(node.style('background-color'));
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
                    data: { id: `color-${color}-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, isColorNode: true },
                    position: { x: currentXPosition, y: 50 },
                    style: {
                        'background-color': color,
                        'width': 30,
                        'height': 30,
                        'label': '',
                        'border-width': 2,
                        'border-color': '#000',
                        'shape': 'ellipse',
                    },
                    locked: false,
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
                message: 'Vous devez essayer de colorer au moins 15% du graphe avant de déclarer qu\'il est impossible !'
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
                message: `${explanation}\n\nTemps: ${formatTime(time)}`
            });
        } else {
            setValidationPopup({
                type: 'error',
                title: "Non, ce graphe n'est pas impossible.",
                message: "Ce graphe peut être coloré correctement. Essayez encore !"
            });
        }
    }

    function handleClosePopup() {
        setValidationPopup(null);
    }
};

const useTimer = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [isRunning]);

    const start = () => {
        setIsRunning(true);
    };

    const stop = () => {
        setIsRunning(false);
    };

    const reset = () => {
        setTime(0);
        setIsRunning(false);
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return { time, isRunning, start, stop, reset, formatTime };
};

export default Defi; 