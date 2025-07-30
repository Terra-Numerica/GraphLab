import useTimer from '../../common/Timer.jsx';
import {useCallback, useEffect, useRef, useState} from "react";
import config from "../../../config.js";
import { useNavigate } from 'react-router-dom';
import GraphDisplay from './PenroseGraphDisplay.jsx';
import {PenroseGraphSort} from "../../../utils/GraphSorting.js";
import Select from 'react-select'
import '../../../styles/pages/RailwayMaze/GlobalMode.css'
import ValidationPopup from "../../common/ValidationPopup.jsx";
import RulesPopup from '../../common/RulesPopup';

const TimerDisplay = (({ time, formatTime }) => {
    return <div className="mode-timer">Temps: {formatTime(time)}</div>;
});

const Penrose = () => {
    const initialGraphData = {
        _id : '',
        name : '',
        data : {
            edges : [],
            nodes : [],
        },
        tag : ['PEN']
    };

    const cyRef = useRef(null);
    const [graphs, setGraphs] = useState([]);
    const [graphData, setGraphData] = useState(null);
    const [graphId, setGraphId] = useState('');
    const [selectOpt, setSelectOpt] = useState([]);
    const [selectedOption, setSelectedOption] = useState();
    const [path, setPath] = useState([]);
    const [currentNode, setCurrentNode] = useState(null);
    const [currentColor, setCurrentColor] = useState(null);
    const [selectableNodes, setSelectableNodes] = useState([]);

    const navigate = useNavigate();
    const { time, start, stop, reset, formatTime} = useTimer();
    const [loading, setLoading] = useState(true);
    const [validationPopup, setValidationPopup] = useState(null);
    const [showRules, setShowRules] = useState(false);


    const handleGraphSelect = (option) => {
        setSelectedOption(option);
        if (option) {
            setGraphData(initialGraphData);
            setGraphId(option.value);
        }
    };

    const fetchGraphs = async () => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/graph`);
                if (!response.ok) {
                    console.error('Impossible de récupérer la liste des graphes');
                }
                const data = await response.json();
                setGraphs(PenroseGraphSort(data));
                setLoading(false);
            } catch {
                console.error('Impossible de récupérer la liste des graphes');
                setLoading(false);
            }
        };
        void fetchData();
    };

    const initGame = useCallback((data) => {
        const nodeA = data.data.nodes.find(node => node.classes && node.classes.includes("A"));
        if (nodeA) {
            setCurrentNode(nodeA);
            setPath([nodeA.data.id]);
        } else {
            console.error("Erreur à l'initialisation du jeu");
        }
    }, []);

    const fetchGraph = useCallback(async () => {
        if (graphId !== '') {
            setCurrentColor(null);
            try {
                const response = await fetch(`${config.apiUrl}/graph/${graphId}`);
                const data = await response.json();
                setGraphData({
                    _id : data._id,
                    name : data.name,
                    data : {
                        nodes : data.data.nodes,
                        edges : data.data.edges
                    },
                    tag : data.tag
                });
                reset();
                start();
                initGame(data)
            } catch (error){
                console.log('Erreur dans fetchGraph :', error);
                setGraphData(null);
            }
        } else {
            setGraphData({
                _id : '',
                name : '',
                data : {
                    edges : [],
                    nodes : [],
                },
                tag : ['PEN']
            })
        }
        setSelectableNodes([]);
    }, [graphId, initGame, reset, start]);

    const handleFinDuJeu = () => {
        stop();
        const sol = algoBFS()
        console.log(path, sol)
        const messagePop = (path.length+1 === sol.length) ?
            "Bravo ! Le chemin que tu propose est valide et optimal" :
            "Bravo ! Le chemin que tu propose est valide. \n Il existe un chemin plus court"
        setValidationPopup({
            type: 'success',
            title: 'Félicitations !',
            message: messagePop + `\n Temps: ${formatTime(time)}`
        });
    }

    const handleNextNode = (nodeID) => {
        if (!graphData || !currentNode) return;
        const clickedNode = graphData.data.nodes.find(node => node.data.id === nodeID);
        if (!clickedNode) {
            console.error("Erreur : pas de node correspondant a celle selectionee")
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
    }

    const handleRetry = async () => {
        void fetchGraph();
    }

    const handleUndo = () => {
        if (path && path.length > 1) {
            const prevNodeId = path[path.length - 2];
            const prevNode = graphData.data.nodes.find(node => node.data.id === prevNodeId);
            const edgeASupp = graphData.data.edges.find(edge =>
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
            setPath(path.slice(0,-1));
            setCurrentNode(prevNode);
        }
    }

    const getVoisins = (id, color) => {
        const voisIDAndCol = new Set ()
        const connectedEdges = graphData.data.edges.filter(
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
                voisIDAndCol.add([(isCurrentSource ? targetId : sourceId),nextColor]);
            }
        })
        return voisIDAndCol;

    }

    const algoBFS = () => {
        const initialNode = graphData.data.nodes.find(node => node.classes && node.classes.includes("A"));
        const endNode = graphData.data.nodes.find(node => node.classes && node.classes.includes("B"));
        if (!initialNode || !initialNode.data.id || !endNode || !endNode.data.id) {
            console.error("Erreur : pas de node trouvee pour depart ou arrivee")
            return [];
        }
        const fileDePassage = [[initialNode.data.id, null,[]]]
        const setDeVisite = new Set ([initialNode.data.id, null]);
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

    const handleShowSolution = () => {
        const chemin = algoBFS()
        setPath([])

        pathColoring([155,135,12],[255,255,0],chemin)
    }

    const edgeColorGradient = (startColor, endColor, factor)  => {
        const resultat = []
        for (let i = 0; i < 3; i++) {
            resultat.push(Math.round(startColor[i]+factor*(endColor[i]-startColor[i])))
        }
        return 'rgb(' + resultat.join(', ') + ')';
    }

    const pathColoring = useCallback((startColor, endColor, pathToColor) => {
        if (!graphData || !pathToColor || pathToColor.length<2) return;
        let hasChanged = false;
        const edgePath = [];
        const colorPath = [];
        for (let i = 1; i < pathToColor.length ; i++) {
            const fNode = pathToColor[i-1];
            const sNode = pathToColor[i];
            const edge = graphData.data.edges.find(edge =>
                (edge.data.source === fNode && edge.data.target === sNode) ||
                (edge.data.source === sNode && edge.data.target === fNode)
            )
            const color1 = edgeColorGradient(startColor, endColor,((i-1)/(pathToColor.length-1)));
            const color2 = edgeColorGradient(startColor, endColor,(i/(pathToColor.length-1)));
            edgePath.push(edge.data.id)
            if (fNode === edge.data.source) {
                colorPath.push([color1, color2]);
            } else {
                colorPath.push([color2, color1]);
            }
        }
        const edgeStyled = graphData.data.edges.map(edge => {
            const index = edgePath.lastIndexOf(edge.data.id)
            if (index === -1) {
                edge.style = {}
                return edge;
            } else {
                const newStyle = {
                    'line-fill': 'linear-gradient',
                    'line-gradient-stop-positions': [50],
                    'line-gradient-stop-colors': [colorPath[index][0],colorPath[index][1]],
                    'line-outline-width' : 1,
                    'line-outline-color' : 'black'
                }
                if (JSON.stringify(edge.style) !== JSON.stringify(newStyle)) {
                    hasChanged = true;
                }
                return {
                    ...edge,
                    style : newStyle
                }
            }
        })
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
    },[graphData])

    const handleClosePopup = () => {
        setValidationPopup(null);
    }

    useEffect(() => {
        void fetchGraphs();
    }, []);

    useEffect(() => {
        const options = graphs.map((graph) => ({
            value: graph._id,
            label: graph.name
        }));
        setSelectOpt(options);
    }, [graphs])

    useEffect(() => {
        void fetchGraph();
    }, [fetchGraph]);

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
        const updatedNodes = graphData.data.nodes.map(node => {
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
        pathColoring([27,79,8], [0,255,0], path)
    }, [path, pathColoring]);

    return (
        <div className="penrose-container">
            <button className="mode-back-btn" onClick={() => navigate('/railway-maze')}>&larr; Retour</button>
            <h2 className="penrose-mode-title">Penrose Maze</h2>
            <div className="penrose-top-bar">
                <Select
                    className="penrose-select"
                    options={selectOpt}
                    value={selectedOption}
                    onChange={handleGraphSelect}
                    placeholder="Select a graph..."
                    isDisabled={loading}
                />
                {<TimerDisplay time={time} formatTime={formatTime} />}
            </div>
            <div className="mode-buttons-row">
                <button className={"mode-btn"} onClick={handleRetry}>Retry</button>
                <button className={"mode-btn"} onClick={handleUndo}>Undo</button>
                <button className={"mode-btn"} onClick={handleShowSolution}>Solution</button>
            </div>
            {<GraphDisplay graphData={graphData} cyRef={cyRef} selectableNodes={selectableNodes} handleNextNode={handleNextNode}/>}
            <button className="mode-rules-btn" onClick={() => setShowRules(true)}>&#9432; Voir les règles</button>
            {validationPopup && (
                <ValidationPopup
                    type={validationPopup.type}
                    title={validationPopup.title}
                    message={validationPopup.message}
                    onClose={handleClosePopup}
                />
            )}
        </div>
    )
};

export default Penrose;