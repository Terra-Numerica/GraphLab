import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';

// Components
import PenroseGraphDisplay from './PenroseGraphDisplay.jsx';
import ValidationPopup from "../../common/ValidationPopup.jsx";
import RulesPopup from '../../common/RulesPopup';

// Hooks
import TimerDisplay from "../../common/TimerDisplay.jsx";
import { useTimer } from "../../../hooks/useTimer.jsx";
import { useFetchGraphs, useFetchGraph } from '../../../hooks/useFetchGraphs';

// Styles
import '../../../styles/pages/RailwayMaze/GlobalMode.css';

const Penrose = () => {
    // Fonction utilitaire pour gérer les classes (chaîne ou tableau)
    const getClassesArray = (classes) => {
        if (!classes) return [];
        return Array.isArray(classes) 
            ? classes 
            : classes.split(' ').filter(cls => cls.trim() !== '');
    };

    const initialGraphData = {
        _id: '',
        name: '',
        data: {
            edges: [],
            nodes: [],
        }
    };

    // Refs and state
    const cyRef = useRef(null);
    const [graphData, setGraphData] = useState(null);
    const [graphId, setGraphId] = useState('');
    const [selectedOption, setSelectedOption] = useState();
    const [path, setPath] = useState([]);
    const [currentNode, setCurrentNode] = useState(null);
    const [currentColor, setCurrentColor] = useState(null);
    const [selectableNodes, setSelectableNodes] = useState([]);

    const navigate = useNavigate();
    const { time, start, stop, reset, formatTime } = useTimer();
    const [validationPopup, setValidationPopup] = useState(null);
    const [showRules, setShowRules] = useState(false);

    // Hooks for fetching data
    const { graphs: fetchedGraphs, loading: graphsLoading, error } = useFetchGraphs();
    const { graph: selectedGraphData, loading: graphLoading } = useFetchGraph({ id: graphId });

    // Graph selection handler
    const handleGraphSelect = (event) => {
        const selectedId = event.target.value;
        if (selectedId) {
            const selectedGraph = fetchedGraphs.find(g => g._id === selectedId);
            setSelectedOption({ value: selectedId, label: selectedGraph?.name || '' });
            setGraphData(initialGraphData);
            setGraphId(selectedId);
        }
    };

    // Initialize game
    const initGame = useCallback((data) => {
        const nodeA = data.data.nodes.find(node => node.classes && node.classes.includes("A"));
        if (nodeA) {
            setCurrentNode(nodeA);
            setPath([nodeA.data.id]);
        } else {
            console.error("Erreur à l'initialisation du jeu");
        }
    }, []);



    // Handle game completion
    const handleFinDuJeu = () => {
        stop();
        const sol = algoBFS();
        const messagePop = (path.length + 1 === sol.length) ?
            "Bravo ! Le chemin que tu propose est valide et optimal" :
            "Bravo ! Le chemin que tu propose est valide. \n Il existe un chemin plus court";
        setValidationPopup({
            type: 'success',
            title: 'Félicitations !',
            message: messagePop + `\n Temps: ${formatTime(time)}`
        });
    };

    // Handle next node selection
    const handleNextNode = (nodeID) => {
        if (!graphData || !currentNode) return;
        const clickedNode = graphData.data.nodes.find(node => node.data.id === nodeID);
        if (!clickedNode) {
            console.error("Erreur : pas de node correspondant a celle selectionee");
            return;
        }
        if (clickedNode.classes.includes('B')) {
            handleFinDuJeu();
            return;
        }
        const connectingEdge = graphData.data.edges.find(edge =>
            (edge.data.source === currentNode.data.id && edge.data.target === clickedNode.data.id) ||
            (edge.data.source === clickedNode.data.id && edge.data.target === currentNode.data.id)
        );
        if (!connectingEdge) {
            console.error("Erreur : pas de edge trouvee");
            return;
        }
        const edgeColorClass = getClassesArray(connectingEdge.classes).find(cls =>
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
    };

    // Retry handler
    const handleRetry = async () => {
        // Reset the game state
        setCurrentColor(null);
        setPath([]);
        setSelectableNodes([]);
        if (selectedGraphData) {
            initGame(selectedGraphData);
            reset();
            start();
        }
    };

    // Undo handler
    const handleUndo = () => {
        if (path && path.length > 1) {
            const prevNodeId = path[path.length - 2];
            const prevNode = graphData.data.nodes.find(node => node.data.id === prevNodeId);
            const edgeASupp = graphData.data.edges.find(edge =>
                (edge.data.source === prevNodeId && edge.data.target === path[path.length - 1]) ||
                (edge.data.source === path[path.length - 1] && edge.data.target === prevNodeId)
            );
            if (!edgeASupp) {
                console.error("Erreur : pas de edge trouvee");
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
                setCurrentColor(null);
            } else {
                const [colorFromSource, colorFromTarget] = edgeColorClass.split('');
                const couleurDepart = (edgeASupp.data.source === prevNodeId) ? colorFromSource : colorFromTarget;
                setCurrentColor((couleurDepart === 'R') ? 'B' : 'R');
            }
            setPath(path.slice(0, -1));
            setCurrentNode(prevNode);
        }
    };

    // Get neighbors
    const getVoisins = (id, color) => {
        const voisIDAndCol = new Set();
        const connectedEdges = graphData.data.edges.filter(
            edge => edge.data.source === id || edge.data.target === id
        );
        connectedEdges.forEach(edge => {
            const sourceId = edge.data.source;
            const targetId = edge.data.target;
            const isCurrentSource = sourceId === id;
            const edgeColorClass = getClassesArray(edge.classes).find(cls =>
                ['RR', 'RB', 'BR', 'BB'].includes(cls)
            );
            if (!edgeColorClass) {
                console.error("erreur : pas de couleur sur un edge");
                return;
            }
            const [colorFromSource, colorFromTarget] = edgeColorClass.split('');
            const outColor = isCurrentSource ? colorFromSource : colorFromTarget;
            const nextColor = isCurrentSource ? colorFromTarget : colorFromSource;
            if (color === null || outColor !== color) {
                voisIDAndCol.add([(isCurrentSource ? targetId : sourceId), nextColor]);
            }
        });
        return voisIDAndCol;
    };

    // BFS algorithm for solution
    const algoBFS = () => {
        const initialNode = graphData.data.nodes.find(node => node.classes && node.classes.includes("A"));
        const endNode = graphData.data.nodes.find(node => node.classes && node.classes.includes("B"));
        if (!initialNode || !initialNode.data.id || !endNode || !endNode.data.id) {
            console.error("Erreur : pas de node trouvee pour depart ou arrivee");
            return [];
        }
        const fileDePassage = [[initialNode.data.id, null, []]];
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
    };

    // Show solution
    const handleShowSolution = () => {
        const chemin = algoBFS();
        setPath([]);
        pathColoring([27, 79, 8], [0, 255, 0], chemin);
    };

    // Edge color gradient calculation
    const edgeColorGradient = (startColor, endColor, factor) => {
        const resultat = [];
        for (let i = 0; i < 3; i++) {
            resultat.push(Math.round(startColor[i] + factor * (endColor[i] - startColor[i])));
        }
        return 'rgb(' + resultat.join(', ') + ')';
    };

    // Path coloring
    const pathColoring = useCallback((startColor, endColor, pathToColor) => {
        if (!graphData || !pathToColor || pathToColor.length < 2) return;
        let hasChanged = false;
        const edgePath = [];
        const colorPath = [];
        for (let i = 1; i < pathToColor.length; i++) {
            const fNode = pathToColor[i - 1];
            const sNode = pathToColor[i];
            const edge = graphData.data.edges.find(edge =>
                (edge.data.source === fNode && edge.data.target === sNode) ||
                (edge.data.source === sNode && edge.data.target === fNode)
            );
            const color1 = edgeColorGradient(startColor, endColor, ((i - 1) / (pathToColor.length - 1)));
            const color2 = edgeColorGradient(startColor, endColor, (i / (pathToColor.length - 1)));
            edgePath.push(edge.data.id);
            if (fNode === edge.data.source) {
                colorPath.push([color1, color2]);
            } else {
                colorPath.push([color2, color1]);
            }
        }
        const edgeStyled = graphData.data.edges.map(edge => {
            const index = edgePath.lastIndexOf(edge.data.id);
            if (index === -1) {
                edge.style = {};
                return edge;
            } else {
                const newStyle = {
                    'line-fill': 'linear-gradient',
                    'line-gradient-stop-positions': [50],
                    'line-gradient-stop-colors': [colorPath[index][0], colorPath[index][1]],
                    'line-outline-width': 1,
                    'line-outline-color': 'black'
                };
                if (JSON.stringify(edge.style) !== JSON.stringify(newStyle)) {
                    hasChanged = true;
                }
                return {
                    ...edge,
                    style: newStyle
                };
            }
        });
        if (hasChanged) {
            setGraphData(prev => ({
                ...prev,
                data: {
                    ...prev.data,
                    nodes: prev.data.nodes,
                    edges: edgeStyled,
                }
            }));
        }
    }, [graphData]);

    // Close popup
    const handleClosePopup = () => {
        setValidationPopup(null);
    };



    useEffect(() => {
        if (selectedGraphData && graphId) {
            setCurrentColor(null);
            setGraphData({
                _id: selectedGraphData._id,
                name: selectedGraphData.name,
                data: {
                    nodes: selectedGraphData.data.nodes,
                    edges: selectedGraphData.data.edges
                }
            });
            reset();
            start();
            initGame(selectedGraphData);
            setSelectableNodes([]);
        }
    }, [selectedGraphData, graphId, initGame, reset, start]);

    useEffect(() => {
        if (!graphData || !currentNode) return;
        const newSelectableNodeIds = new Set();
        const connectedEdges = graphData.data.edges.filter(
            edge => edge.data.source === currentNode.data.id || edge.data.target === currentNode.data.id
        );
        connectedEdges.forEach(edge => {
            const sourceId = edge.data.source;
            const targetId = edge.data.target;
            const isCurrentSource = sourceId === currentNode.data.id;
            const edgeColorClass = getClassesArray(edge.classes).find(cls =>
                ['RR', 'RB', 'BR', 'BB'].includes(cls)
            );
            if (!edgeColorClass) {
                console.error("erreur : pas de couleur sur un edge");
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
        const updatedNodes = graphData.data.nodes.map(node => {
            const classes = new Set(
                Array.isArray(node.classes) ? node.classes : (node.classes || '').split(' ')
            );
            classes.delete('selectable');
            classes.delete('selected');
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
        setGraphData({
            ...graphData,
            data: {
                ...graphData.data,
                nodes: updatedNodes,
            }
        });
        setSelectableNodes([...newSelectableNodeIds]);
    }, [graphData, currentNode, currentColor, selectableNodes]);

    useEffect(() => {
        pathColoring([27, 79, 8], [0, 255, 0], path);
    }, [path, pathColoring]);

    return (
        <div className="mode-container">
            <button className="mode-back-btn" onClick={() => navigate('/railway-maze')}>&larr; Retour</button>
            <h2 className="mode-title">Penrose Maze</h2>
            <div className="mode-top-bar">
                <select
                    className="mode-select"
                    value={selectedOption?.value || ''}
                    onChange={handleGraphSelect}
                    disabled={graphsLoading}
                >
                    <option value="" disabled hidden>
                        {graphsLoading ? "Chargement des graphes..." : "Choisis un graphe"}
                    </option>
                    {fetchedGraphs
                        .filter((graph) => {
                            // Vérifier si le graphe a des nœuds avec les classes A et B (départ et arrivée)
                            const hasNodeA = graph.data.nodes.some(node => 
                                node.classes && node.classes.includes("A")
                            );
                            const hasNodeB = graph.data.nodes.some(node => 
                                node.classes && node.classes.includes("B")
                            );
                            
                            // Vérifier si le graphe a des arêtes avec des classes de couleur Labyrinthe Voyageur
                            const hasRailwayEdges = graph.data.edges.some(edge => {
                                const classesArray = getClassesArray(edge.classes);
                                return classesArray.some(cls => ['RR', 'RB', 'BR', 'BB'].includes(cls));
                            });
                            
                            // Un graphe Labyrinthe Voyageur doit avoir les nœuds A et B et des arêtes colorées
                            return hasNodeA && hasNodeB && hasRailwayEdges;
                        })
                        .map((graph) => (
                            <option key={graph._id} value={graph._id}>
                                {graph.name}
                            </option>
                        ))}
                </select>
                <TimerDisplay time={time} formatTime={formatTime} />
            </div>
            <div className="mode-buttons-row">
                <button className="mode-btn mode-btn-validate" onClick={handleRetry}>Recommencer</button>
                <button className="mode-btn mode-btn-validate" onClick={handleUndo}>Annuler</button>
                <button className="mode-btn mode-btn-validate" onClick={handleShowSolution}>Solution</button>
            </div>
            <PenroseGraphDisplay 
                graphData={graphData} 
                cyRef={cyRef} 
                selectableNodes={selectableNodes} 
                handleNextNode={handleNextNode}
            />
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
                <RulesPopup title="Règles du Labyrinthe Voyageur" onClose={() => setShowRules(false)}>
                    <h3>Objectif</h3>
                    <ul>
                        <li>Naviguez de la station A vers la station B</li>
                        <li>Respectez les règles de couleur des rails</li>
                        <li>Trouvez le chemin optimal</li>
                    </ul>
                    <h3>Règles de couleur</h3>
                    <ul>
                        <li>RR : Rail orange vers orange</li>
                        <li>RB : Rail orange vers bleu</li>
                        <li>BR : Rail bleu vers orange</li>
                        <li>BB : Rail bleu vers bleu</li>
                    </ul>
                </RulesPopup>
            )}
        </div>
    );
};

export default Penrose;
