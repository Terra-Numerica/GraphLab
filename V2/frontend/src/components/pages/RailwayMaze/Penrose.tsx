// Imports
import { useFetchGraph, useFetchGraphs } from "../../../hooks/useFetchGraphs";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTimer } from '../../../hooks/useTimer';
import { useNavigate } from 'react-router-dom';
import { Graph, Node, Edge } from '../../../types';

// Extended types for RailwayMaze specific properties
type ExtendedNode = Omit<Node, 'classes'> & { classes?: string[] };
type ExtendedEdge = Edge & { classes?: string[]; style?: Record<string, any> };
type ExtendedGraph = {
    name: string;
    data: {
        nodes: ExtendedNode[];
        edges: ExtendedEdge[];
    };
};

import ValidationPopup from "../../common/ValidationPopup";
import RulesPopup from '../../common/RulesPopup';
import GraphDisplay from './PenroseGraphDisplay';
import TimerDisplay from '../../common/TimerDisplay';

// Style
import '../../../styles/pages/RailwayMaze/RailwayMazeStyles.css';

const GraphDisplayMemo = memo(GraphDisplay);

const Penrose: React.FC = () => {

    const cyRef = useRef<cytoscape.Core | null>(null);
    const [path, setPath] = useState<string[]>([]);
    const [currentNode, setCurrentNode] = useState<ExtendedNode | null>(null);
    const [currentColor, setCurrentColor] = useState<string | null>(null);
    const [selectableNodes, setSelectableNodes] = useState<string[]>([]);

    const [graphs, setGraphs] = useState<Graph[]>([]);
    const [selectedGraph, setSelectedGraph] = useState('');
    const [currentGraph, setCurrentGraph] = useState<ExtendedGraph | null>(null);
    const [validationPopup, setValidationPopup] = useState<{
        type: 'warning' | 'error' | 'success';
        title: string;
        message: string;
    } | null>(null);
    const [showRules, setShowRules] = useState<boolean>(false);
    const { time, start, stop, reset, formatTime } = useTimer();
    const navigate = useNavigate();

    const { graphs: fetchedGraphs, loading: graphsLoading } = useFetchGraphs();
    const { graph: selectedGraphData, loading: graphLoading } = useFetchGraph({ id: selectedGraph });

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

            const penroseWorkshops = fetchedGraphs.filter((graph) => graph.workshopData.railwayMaze?.enabled);

            setGraphs(penroseWorkshops);
        }
    }, [fetchedGraphs]);

    useEffect(() => {
        if (selectedGraphData?.data) {

            setCurrentGraph({
                name: selectedGraphData.name,
                data: {
                    nodes: selectedGraphData.data.nodes.map((node: Node) => ({
                        ...node,
                        classes: Array.isArray(node.classes) ? node.classes : (node.classes || '').split(' ').filter(Boolean)
                    })),
                    edges: selectedGraphData.data.edges.map((edge: Edge) => ({
                        ...edge,
                        classes: (edge as any).classes ? 
                            (Array.isArray((edge as any).classes) ? (edge as any).classes : ((edge as any).classes || '').split(' ').filter(Boolean)) :
                            []
                    }))
                }
            });
            initGame(selectedGraphData);
            reset();
            start();
        }
    }, [selectedGraphData]);

    const handleGraphSelect = (event: React.ChangeEvent<HTMLSelectElement>): void => {

        const graphId = event.target.value;

        setSelectedGraph(graphId);

        if (!graphId) {
            setCurrentGraph(null);
            reset();
        };
    };

    const initGame = useCallback((graphData: Graph) => {
        const nodeA = graphData.data.nodes.find((node: Node) => {
            const classes = Array.isArray(node.classes) ? node.classes : (node.classes || '').split(' ').filter(Boolean);
            return classes.includes("A");
        });
        if (nodeA) {
            setCurrentNode({
                ...nodeA,
                classes: Array.isArray(nodeA.classes) ? nodeA.classes : (nodeA.classes || '').split(' ').filter(Boolean)
            });
            setPath([nodeA.data.id]);
        } else {
            console.error("Erreur à l'initialisation du jeu");
        }
    }, []);

    //Affiche un message au joueur à la fin du jeu (différents si path optimal)
    const handleFinDuJeu = () => {
        stop();
        const sol = algoBFS();
        const messagePop = (path.length + 1 === (sol?.length || 0)) ?
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
    const handleNextNode = useCallback((nodeID: string) => {
        if (!currentGraph || !currentNode) return;
        const clickedNode = currentGraph.data.nodes.find((node: ExtendedNode) => node.data.id === nodeID);
        if (!clickedNode) {
            console.error("Erreur : pas de node correspondant a celle selectionee")
            return;
        }
        if (clickedNode.classes?.includes('B')) {
            handleFinDuJeu();
            return;
        }
        const connectingEdge = currentGraph.data.edges.find((edge: ExtendedEdge) =>
            (edge.data.source === currentNode.data.id && edge.data.target === clickedNode.data.id) ||
            (edge.data.source === clickedNode.data.id && edge.data.target === currentNode.data.id)
        );
        if (!connectingEdge) {
            console.error("Erreur : pas de edge trouvee")
            return;
        }
        const edgeColorClass = (connectingEdge.classes || []).find((cls: string) =>
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
        
        const resetEdges = currentGraph.data.edges.map((edge: ExtendedEdge) => ({
            ...edge,
            style: {}
        }));
        
        setCurrentGraph((prev) => {
            if (!prev) return null;
            return {
                ...prev,
                data: {
                    ...prev.data,
                    nodes: prev.data.nodes,
                    edges: resetEdges,
                }
            };
        });
        
        initGame(currentGraph as unknown as Graph);
        
        // Reset timer
        reset();
        start();
        
        // Clear any validation popup
        setValidationPopup(null);
    }, [currentGraph, initGame, reset, start]);

    //Récupère la précédente node du path et l'utilise pour récupérer la couleur d'arrivée correcte après l'undo
    const handleUndo = () => {
        if (path && path.length > 1 && currentGraph) {
            const prevNodeId = path[path.length - 2];
            const prevNode = currentGraph.data.nodes.find((node: ExtendedNode) => node.data.id === prevNodeId);
            const edgeASupp = currentGraph.data.edges.find((edge: ExtendedEdge) =>
                (edge.data.source === prevNodeId && edge.data.target === path[path.length - 1]) ||
                (edge.data.source === path[path.length - 1] && edge.data.target === prevNodeId)
            )
            if (!edgeASupp) {
                console.error("Erreur : pas de edge trouvee")
                return;
            }
            const edgeColorClass = (edgeASupp.classes || []).find((cls: string) =>
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
            setCurrentNode(prevNode ? {
                ...prevNode,
                classes: Array.isArray(prevNode.classes) ? prevNode.classes : (prevNode.classes || '').split(' ').filter(Boolean)
            } : null);
        }
    }

    //Récupère les voisins d'une node ainsi que la couleur d'arrivée à chaque voisin
    const getVoisins = (id: string, color: string | null): Set<[string, string]> => {
        const voisIDAndCol = new Set<[string, string]>()
        if (!currentGraph) return voisIDAndCol;
        
        const connectedEdges = currentGraph.data.edges.filter(
            (edge: ExtendedEdge) => edge.data.source === id || edge.data.target === id
        );
        connectedEdges.forEach((edge: ExtendedEdge) => {
            const sourceId = edge.data.source;
            const targetId = edge.data.target;
            const isCurrentSource = sourceId === id;
            const edgeColorClass = (edge.classes || []).find((cls: string) =>
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
    const algoBFS = (): string[] => {
        if (!currentGraph) return [];
        
        const initialNode = currentGraph.data.nodes.find((node: ExtendedNode) => node.classes && node.classes.includes("A"));
        const endNode = currentGraph.data.nodes.find((node: ExtendedNode) => node.classes && node.classes.includes("B"));
        if (!initialNode || !initialNode.data.id || !endNode || !endNode.data.id) {
            console.error("Erreur : pas de node trouvee pour depart ou arrivee")
            return [];
        }
        const fileDePassage: [string, string | null, string[]][] = [[initialNode.data.id, null, []]]
        const setDeVisite = new Set<string>([`${initialNode.data.id}-null`]);
        while (fileDePassage.length > 0) {
            const [nodeId, entryColor, nodePath] = fileDePassage.shift()!;
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
    const edgeColorGradient = (startColor: number[], endColor: number[], factor: number): string => {
        const resultat: number[] = []
        for (let i = 0; i < 3; i++) {
            resultat.push(Math.round(startColor[i] + factor * (endColor[i] - startColor[i])))
        }
        return 'rgb(' + resultat.join(', ') + ')';
    }

    //Applique à un chemin donné en paramètre un gradient de couleur dependant des couleurs données
    const pathColoring = useCallback((startColor: number[], endColor: number[], pathToColor: string[]) => {
        if (!currentGraph || !pathToColor || pathToColor.length < 2) return;
        let hasChanged = false;
        const edgePath: string[] = [];
        const colorPath: [string, string][] = [];
        for (let i = 1; i < pathToColor.length; i++) {
            const fNode = pathToColor[i - 1];
            const sNode = pathToColor[i];
            const edge = currentGraph.data.edges.find((edge: ExtendedEdge) =>
                (edge.data.source === fNode && edge.data.target === sNode) ||
                (edge.data.source === sNode && edge.data.target === fNode)
            )
            if (!edge) continue;
            
            const color1 = edgeColorGradient(startColor, endColor, ((i - 1) / (pathToColor.length - 1)));
            const color2 = edgeColorGradient(startColor, endColor, (i / (pathToColor.length - 1)));
            edgePath.push(edge.data.id)
            if (fNode === edge.data.source) {
                colorPath.push([color1, color2]);
            } else {
                colorPath.push([color2, color1]);
            }
        }
        const edgeStyled = currentGraph.data.edges.map((edge: ExtendedEdge) => {
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
            setCurrentGraph((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    data: {
                        ...prev.data,
                        nodes: prev.data.nodes,
                        edges: edgeStyled,
                    }
                };
            });
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
        const newSelectableNodeIds = new Set<string>();
        const connectedEdges = currentGraph.data.edges.filter(
            (edge: ExtendedEdge) => edge.data.source === currentNode.data.id || edge.data.target === currentNode.data.id
        );
        connectedEdges.forEach((edge: ExtendedEdge) => {
            const sourceId = edge.data.source;
            const targetId = edge.data.target;
            const isCurrentSource = sourceId === currentNode.data.id;
            const edgeColorClass = (edge.classes || []).find((cls: string) =>
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
        const hasChanged = ([...newSelectableNodeIds].some((id: string) => !prevNodeIds.has(id))) || newSelectableNodeIds.size !== prevNodeIds.size;
        if (!hasChanged) return;
        const updatedNodes = currentGraph.data.nodes.map((node: ExtendedNode) => {
            const classes = new Set(
                node.classes || []
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
        <div className="penrose-container">
            <button className="penrose-back-btn" onClick={() => navigate('/railway-maze')}>&larr; Retour</button>
            <h2 className="workshop-title">Penrose Maze</h2>
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
                    {graphs.map((graph) => (
                        <option key={graph._id} value={graph._id}>
                            {graph.name}
                        </option>
                    ))}
                </select>
                {currentGraph && <TimerDisplay time={time} formatTime={formatTime} />}
            </div>

            {currentGraph && !graphLoading && <div className="workshop-buttons-row">
                <button className="workshop-btn workshop-btn-reset" onClick={handleUndo}>Revenir en arrière</button>
                <button className="workshop-btn workshop-btn-validate" onClick={handleRetry}>Réinitialiser</button>
                <button className="workshop-btn workshop-btn-validate" onClick={handleShowSolution}>Solution</button>
            </div>}

            {currentGraph && <GraphDisplayMemo graphData={currentGraph as unknown as Graph} cyRef={cyRef} selectableNodes={selectableNodes} handleNextNode={handleNextNode} />}
            
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
                <RulesPopup title="Règles du Jeu" onClose={() => setShowRules(false)}>
                    <h3> PlaceholderCat1 </h3>
                    <ul>
                        <li>PlaceholderLigne1</li>
                        <li>PlaceholderLigne2</li>
                    </ul>
                    <h3> PlaceholderCat2 </h3>
                </RulesPopup>
            )}
        </div>
    )
};

export default Penrose;