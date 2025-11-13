// Imports
import { useFetchGraph, useFetchGraphs } from "../../../hooks/useFetchGraphs.jsx";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTimer } from '../../../hooks/useTimer';
import { useNavigate } from 'react-router-dom';

import ValidationPopup from "../../common/ValidationPopup.jsx";
import RulesPopup from '../../common/RulesPopup';
import GraphDisplay from './PenroseGraphDisplay.jsx';
import TimerDisplay from '../../common/TimerDisplay.jsx';

// ❌ supprimé : import '../../../styles/pages/RailwayMaze/RailwayMazeStyles.css';

const GraphDisplayMemo = memo(GraphDisplay);

const Penrose = () => {

    const cyRef = useRef(null);
    const [path, setPath] = useState([]);
    const [currentNode, setCurrentNode] = useState(null);
    const [currentColor, setCurrentColor] = useState(null);
    const [selectableNodes, setSelectableNodes] = useState([]);

    const [graphs, setGraphs] = useState([]);
    const [selectedGraph, setSelectedGraph] = useState('');
    const [currentGraph, setCurrentGraph] = useState(null);
    const [validationPopup, setValidationPopup] = useState(null);
    const [showRules, setShowRules] = useState(false);
    const { time, start, stop, reset, formatTime } = useTimer();
    const navigate = useNavigate();

    const { graphs: fetchedGraphs, loading: graphsLoading, error: graphsError } = useFetchGraphs();
    const { graph: selectedGraphData, loading: graphLoading, error: graphError } = useFetchGraph({ id: selectedGraph });

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

    useEffect(() => {
        if (fetchedGraphs.length > 0) {

            const penroseWorkshops = fetchedGraphs.filter((graph) => graph.workshopData.railwayMaze.enabled);

            setGraphs(penroseWorkshops);
        }
    }, [fetchedGraphs]);

    useEffect(() => {
        if (selectedGraphData?.data) {

            setCurrentGraph({
                name: selectedGraphData.name,
                data: selectedGraphData.data,
            });
            initGame(selectedGraphData);
            reset();
            start();
        }
    }, [selectedGraphData]);

    const handleGraphSelect = (event) => {

        const graphId = event.target.value;

        setSelectedGraph(graphId);

        if (!graphId) {
            setCurrentGraph(null);
            reset();
        };
    };

    const initGame = useCallback((graphData) => {
        const nodeA = graphData.data.nodes.find(node => node.classes && node.classes.includes("A"));
        if (nodeA) {
            setCurrentNode(nodeA);
            setPath([nodeA.data.id]);
        } else {
            console.error("Erreur à l'initialisation du jeu");
        }
    }, []);

    //Affiche un message au joueur à la fin du jeu (différents si path optimal)
    const handleFinDuJeu = () => {
        stop();
        const sol = algoBFS()
        const messagePop = (path.length + 1 === sol.length) ?
            "Bravo ! Le chemin que tu propose est valide et optimal" :
            "Bravo ! Le chemin que tu propose est valide. \n Il existe un chemin plus court"
        setValidationPopup({
            type: 'success',
            title: 'Félicitations !',
            message: messagePop + `\n Temps: ${formatTime(time)}`
        });
    }

    //Récupère l'ID de la node suivante et
    //à partir de la node de depart (currentNode) memorise la couleur "d'arrivée" actuelle
    const handleNextNode = useCallback((nodeID) => {
        if (!currentGraph || !currentNode) return;
        const clickedNode = currentGraph.data.nodes.find(node => node.data.id === nodeID);
        if (!clickedNode) {
            console.error("Erreur : pas de node correspondant a celle selectionee")
            return;
        }
        if (clickedNode.classes.includes('B')) {
            handleFinDuJeu();
            return;
        }
        const connectingEdge = currentGraph.data.edges.find(edge =>
            (edge.data.source === currentNode.data.id && edge.data.target === clickedNode.data.id) ||
            (edge.data.source === clickedNode.data.id && edge.data.target === currentNode.data.id)
        );
        if (!connectingEdge) {
            console.error("Erreur : pas de edge trouvee")
            return;
        }
        const edgeColorClass = (connectingEdge.classes || []).find(cls =>
            ['RR', 'RB', 'BR', 'BB'].includes(cls)
        );
        if (!edgeColorClass) {
            console.error("Erreur : pas de couleur sur l'edge");
            return;
        }
        const [colorFromSource, colorFromTarget] = edgeColorClass.split('');
        const color = (connectingEdge.data.source === currentNode.data.id) ? colorFromTarget : colorFromSource;
        setPath(prevPath => [...prevPath, clickedNode.data.id]);
        setCurrentColor(color);
        setCurrentNode(clickedNode);
    }, [currentGraph, currentNode]);

    const handleRetry = useCallback(() => {
        if (!currentGraph) return;
        
        const resetEdges = currentGraph.data.edges.map(edge => ({
            ...edge,
            style: {}
        }));
        
        setCurrentGraph(prev => ({
            ...prev,
            data: {
                ...prev.data,
                nodes: prev.data.nodes,
                edges: resetEdges,
            }
        }));
        
        initGame(currentGraph);
        
        // Reset timer
        reset();
        start();
        
        // Clear any validation popup
        setValidationPopup(null);
    }, [currentGraph, initGame, reset, start]);

    //Récupère la précédente node du path et l'utilise pour récupérer la couleur d'arrivée correcte après l'undo
    const handleUndo = () => {
        if (path && path.length > 1) {
            const prevNodeId = path[path.length - 2];
            const prevNode = currentGraph.data.nodes.find(node => node.data.id === prevNodeId);
            const edgeASupp = currentGraph.data.edges.find(edge =>
                (edge.data.source === prevNodeId && edge.data.target === path[path.length - 1]) ||
                (edge.data.source === path[path.length - 1] && edge.data.target === prevNodeId)
            )
            if (!edgeASupp) {
                console.error("Erreur : pas de edge trouvee")
                return;
            }
            const edgeColorClass = (edgeASupp.classes || []).find(cls =>
                ['RR', 'RB', 'BR', 'BB'].includes(cls)
            );
            if (!edgeColorClass) {
                console.error("Erreur : pas de couleur sur l'edge");
                return;
            }
            if (path.length === 2) {
                setCurrentColor(null)
            } else {
                const [colorFromSource, colorFromTarget] = edgeColorClass.split('');
                const couleurDepart = (edgeASupp.data.source === prevNodeId) ? colorFromSource : colorFromTarget;
                setCurrentColor((couleurDepart === 'R') ? 'B' : 'R')
            }
            setPath(path.slice(0, -1));
            setCurrentNode(prevNode);
        }
    }

    //Récupère les voisins d'une node ainsi que la couleur d'arrivée à chaque voisin
    const getVoisins = (id, color) => {
        const voisIDAndCol = new Set()
        const connectedEdges = currentGraph.data.edges.filter(
            edge => edge.data.source === id || edge.data.target === id
        );
        connectedEdges.forEach(edge => {
            const sourceId = edge.data.source;
            const targetId = edge.data.target;
            const isCurrentSource = sourceId === id;
            const edgeColorClass = (edge.classes || []).find(cls =>
                ['RR', 'RB', 'BR', 'BB'].includes(cls)
            );
            if (!edgeColorClass) {
                console.error("erreur : pas de couleur sur un edge")
                return;
            }
            const [colorFromSource, colorFromTarget] = edgeColorClass.split('');
            const outColor = isCurrentSource ? colorFromSource : colorFromTarget;
            //On récupère la couleur d'entrée à la node suivante
            const nextColor = isCurrentSource ? colorFromTarget : colorFromSource;
            if (color === null || outColor !== color) {
                voisIDAndCol.add([(isCurrentSource ? targetId : sourceId), nextColor]);
            }
        })
        return voisIDAndCol;

    }

    ///Determine le path solution avec un BFS
    ///Rend [] si pas de solution
    const algoBFS = () => {
        const initialNode = currentGraph.data.nodes.find(node => node.classes && node.classes.includes("A"));
        const endNode = currentGraph.data.nodes.find(node => node.classes && node.classes.includes("B"));
        if (!initialNode || !initialNode.data.id || !endNode || !endNode.data.id) {
            console.error("Erreur : pas de node trouvee pour depart ou arrivee")
            return [];
        }
        const fileDePassage = [[initialNode.data.id, null, []]]
        const setDeVisite = new Set([initialNode.data.id, null]);
        while (fileDePassage.length > 0) {
            const [nodeId, entryColor, nodePath] = fileDePassage.shift();
            if (nodeId === endNode.data.id) {
                return [...nodePath, nodeId];
            }
            const voisins = getVoisins(nodeId, entryColor);
            voisins.forEach(([voisinID, nextColor]) => {
                const key = `${voisinID}-${nextColor}`;
                if (!setDeVisite.has(key)) {
                    setDeVisite.add(key);
                    const newPath = [...nodePath, nodeId];
                    fileDePassage.push([voisinID, nextColor, newPath]);
                }
            });
        }
        return [];
    }

    //On change le path pour qu'il devienne vide et on affiche la solution rendue par algoBFS
    const handleShowSolution = () => {
        const chemin = algoBFS()
        setPath([])
        pathColoring([27, 79, 8], [0, 255, 0], chemin)
    }

    //Calcule les deux valeurs rbg pour un edge à partir des deux couleurs de l'edge complet
    //pour un certain facteur (correspondant à sa position dans le path)
    const edgeColorGradient = (startColor, endColor, factor) => {
        const resultat = []
        for (let i = 0; i < 3; i++) {
            resultat.push(Math.round(startColor[i] + factor * (endColor[i] - startColor[i])))
        }
        return 'rgb(' + resultat.join(', ') + ')';
    }

    //Applique à un chemin donné en paramètre un gradient de couleur dependant des couleurs données
    const pathColoring = useCallback((startColor, endColor, pathToColor) => {
        if (!currentGraph || !pathToColor || pathToColor.length < 2) return;
        let hasChanged = false;
        const edgePath = [];
        const colorPath = [];
        for (let i = 1; i < pathToColor.length; i++) {
            const fNode = pathToColor[i - 1];
            const sNode = pathToColor[i];
            const edge = currentGraph.data.edges.find(edge =>
                (edge.data.source === fNode && edge.data.target === sNode) ||
                (edge.data.source === sNode && edge.data.target === fNode)
            )
            const color1 = edgeColorGradient(startColor, endColor, ((i - 1) / (pathToColor.length - 1)));
            const color2 = edgeColorGradient(startColor, endColor, (i / (pathToColor.length - 1)));
            edgePath.push(edge.data.id)
            if (fNode === edge.data.source) {
                colorPath.push([color1, color2]);
            } else {
                colorPath.push([color2, color1]);
            }
        }
        const edgeStyled = currentGraph.data.edges.map(edge => {
            const index = edgePath.lastIndexOf(edge.data.id)
            if (index === -1) {
                edge.style = {}
                return edge;
            } else {
                const newStyle = {
                    'line-fill': 'linear-gradient',
                    'line-gradient-stop-positions': [50],
                    'line-gradient-stop-colors': [colorPath[index][0], colorPath[index][1]],
                    'line-outline-width': 1,
                    'line-outline-color': 'black'
                }
                //Verification (potentiellement imparfaite) des changements de style
                if (JSON.stringify(edge.style) !== JSON.stringify(newStyle)) {
                    hasChanged = true;
                }
                return {
                    ...edge,
                    style: newStyle
                }
            }
        })
        if (hasChanged) {
            setCurrentGraph(prev => ({
                ...prev,
                data: {
                    ...prev.data,
                    nodes: prev.data.nodes,
                    edges: edgeStyled,
                }
            }));
        }
    }, [currentGraph])

    //Tiré du code de Mael
    const handleClosePopup = () => {
        setValidationPopup(null);
    }

    //Réagit au changement de currentNode et calcule les nodes selectables
    // pour rajouter les classes adaptées aux différents nodes
    useEffect(() => {
        if (!currentGraph || !currentNode) return;
        const newSelectableNodeIds = new Set();
        const connectedEdges = currentGraph.data.edges.filter(
            edge => edge.data.source === currentNode.data.id || edge.data.target === currentNode.data.id
        );
        connectedEdges.forEach(edge => {
            const sourceId = edge.data.source;
            const targetId = edge.data.target;
            const isCurrentSource = sourceId === currentNode.data.id;
            const edgeColorClass = (edge.classes || []).find(cls =>
                ['RR', 'RB', 'BR', 'BB'].includes(cls)
            );
            if (!edgeColorClass) {
                console.error("erreur : pas de couleur sur un edge")
                return;
            }
            const [colorFromSource, colorFromTarget] = edgeColorClass.split('');
            const exitColor = isCurrentSource ? colorFromSource : colorFromTarget;
            if (currentColor === null || exitColor !== currentColor) {
                const neighborId = isCurrentSource ? targetId : sourceId;
                newSelectableNodeIds.add(neighborId);
            }
        });
        const prevNodeIds = new Set(selectableNodes);
        const hasChanged = ([...newSelectableNodeIds].some(id => !prevNodeIds.has(id))) || newSelectableNodeIds.size !== prevNodeIds.size;
        if (!hasChanged) return;
        const updatedNodes = currentGraph.data.nodes.map(node => {
            const classes = new Set(
                Array.isArray(node.classes) ? node.classes : (node.classes || '').split(' ')
            );
            classes.delete('selectable');
            classes.delete('selected')
            if (newSelectableNodeIds.has(node.data.id)) {
                classes.add('selectable');
            }
            if (node.data.id === currentNode.data.id) {
                classes.add('selected');
            }
            return {
                ...node,
                classes: Array.from(classes),
            };
        });
        setCurrentGraph({
            ...currentGraph,
            data: {
                ...currentGraph.data,
                nodes: updatedNodes,
            }
        });
        setSelectableNodes([...newSelectableNodeIds]);
    }, [currentGraph, currentNode, currentColor, selectableNodes]);

    //Active la fonction pathColoring sur le path à chaque fois qu'il change
    useEffect(() => {
        pathColoring([27, 79, 8], [0, 255, 0], path)
    }, [path, pathColoring]);

    //La partie "HTML" du composant : c'est ce qui est réellement affiché
    //Le composant GraphDisplay depend du fichier PenroseGraphDisplay et correspond à ce qui
    //est affiché en tant que graph.
    return (
        <div className="w-full bg-gray-100 px-4 sm:px-8 md:px-16 py-8">
            <div className="mx-auto max-w-6xl">
                {/* Back button */}
                <button 
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-blue px-4 py-2 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                    onClick={() => navigate('/railway-maze')}
                >
                    <span aria-hidden="true">←</span> Retour
                </button>

                {/* Title */}
                <h2 className="mt-4 text-center text-3xl md:text-4xl font-bold text-darkBlue">Penrose Maze</h2>

                {/* Top bar */}
                <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow md:flex-row md:items-center md:justify-between">
                    <div className="flex w-full items-center gap-3 md:w-auto md:flex-row">
                        <select
                            className="w-full rounded-xl border border-grey bg-white px-3 py-2 text-astro shadow-sm focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30 md:w-72"
                            value={selectedGraph}
                            onChange={handleGraphSelect}
                            disabled={graphsLoading}
                        >
                            <option value="" disabled hidden>
                                {graphsLoading ? "Chargement des graphes..." : "Choisis un graphe"}
                            </option>
                            {graphs.map((graph) => (
                                <option key={graph._id} value={graph._id}>
                                    {graph.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-end">
                        {currentGraph && <TimerDisplay time={time} formatTime={formatTime} />}
                    </div>
                </div>

                {/* Error messages */}
                <div className="mt-4">
                    {graphsError && (
                        <div className="rounded-lg bg-red/10 px-3 py-2 text-sm font-medium text-red">
                            {graphsError}
                        </div>
                    )}
                    {graphError && !fetchedGraphs && (
                        <div className="rounded-lg bg-red/10 px-3 py-2 text-sm font-medium text-red">
                            {graphError}
                        </div>
                    )}
                </div>

                {/* Action buttons */}
                {currentGraph && !graphLoading && (
                    <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                        <button 
                            className="inline-flex items-center justify-center rounded-xl border-2 border-blue px-5 py-2.5 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
                            onClick={handleUndo}
                        >
                            Revenir en arrière
                        </button>
                        <button 
                            className="inline-flex items-center justify-center rounded-xl border-2 border-red px-5 py-2.5 text-sm font-semibold text-red hover:bg-red hover:text-white transition focus:outline-none focus:ring-2 focus:ring-red/40"
                            onClick={handleRetry}
                        >
                            Réinitialiser
                        </button>
                        <button 
                            className="inline-flex items-center justify-center rounded-xl border-2 border-green px-5 py-2.5 text-sm font-semibold text-green hover:bg-green hover:text-white transition focus:outline-none focus:ring-2 focus:ring-green/40"
                            onClick={handleShowSolution}
                        >
                            Solution
                        </button>
                    </div>
                )}

                {/* Graph display */}
                {currentGraph && (
                    <div className="mt-6 overflow-hidden rounded-2xl bg-white p-3 shadow">
                        <GraphDisplayMemo graphData={currentGraph} cyRef={cyRef} selectableNodes={selectableNodes} handleNextNode={handleNextNode} />
                    </div>
                )}

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
                    <RulesPopup title="Règles du Jeu" onClose={() => setShowRules(false)}>
                        <h3> PlaceholderCat1 </h3>
                        <ul className="list-disc pl-5">
                            <li>PlaceholderLigne1</li>
                            <li>PlaceholderLigne2</li>
                        </ul>
                        <h3 className="mt-4"> PlaceholderCat2 </h3>
                    </RulesPopup>
                )}
            </div>
        </div>
    )
};

export default Penrose;