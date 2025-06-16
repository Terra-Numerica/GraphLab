import useTimer from '../../common/Timer.jsx';
import {useCallback, useEffect, useRef, useState} from "react";
import config from "../../../config.js";
import { useNavigate } from 'react-router-dom';
import GraphDisplay from './PenroseGraphDisplay.jsx';

const Penrose = () => {
    const TimerDisplay = ({ time, formatTime }) => {
        return <div className="mode-timer">Temps: {formatTime(time)}</div>;
    };

    const navigate = useNavigate();

    const [graphs, setGraphs] = useState({});
    const { time, start, stop, reset, formatTime, isRunning } = useTimer();
    const [selectedGraph, setSelectedGraph] = useState('');
    const [selectedEdges, setSelectedEdges] = useState(new Set());
    const [currentNode, setCurrentNode] = useState(null);
    const [currentColor, setCurrentColor] = useState(null);
    const [currentGraph, setCurrentGraph] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const cyRef = useRef(null);

    const handleGraphSelect = useCallback((event) => {
        const graphId = event.target.value;
        setSelectedGraph(graphId);
        setCurrentGraph(null);
        reset();
    }, [reset]);

    useEffect(() => {
        void fetchGraphs();
    }, []);

    useEffect(() => {
        if(selectedGraph === '') {
            setCurrentGraph(null);
            return;
        }
        const fetchGraph = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/graph/${selectedGraph}`);
                if (!response.ok) {
                    throw new Error('Impossible de récupérer les détails du graphe');
                }
                const graphConfig = await response.json();
                if (graphConfig?.data) {
                    setCurrentGraph( {
                        name: graphConfig.name,
                        data: graphConfig.data,
                        style : graphConfig.style
                    });
                    reset();
                    start();
                } else {
                    throw new Error('Données invalides pour le graphe');
                }
            } catch (err){
                setError(err);
                setCurrentGraph(null);
            }
        }
        void fetchGraph();
    },[selectedGraph,reset,start])

    const fetchGraphs = async () => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${config.apiUrl}/graph`);
                if (!response.ok) {
                    throw new Error('Impossible de récupérer la liste des graphes');
                }
                const data = await response.json();
                /**@namespace graph.isEColored*/
                setGraphs(data.filter((graph) => 'isEColored' in graph));
                setLoading(false);
            } catch {
                setError('Impossible de récupérer la liste des graphes');
                setLoading(false);
            }
        };
        void fetchData();
    };

    const usableEdge = (edge) => {
        if ('color' in edge.data) {
            return edge.data.color[0] !== currentColor;
        } else {
            setError('Données invalides pour le graphe');
            setCurrentGraph(null);
        }
    };

    const handleNodeSelect = (node) => {
        if (!cyRef.current) return;

        const cEdge = currentGraph.data.edges.find(({edge}) => edge.data.source === currentNode.data.id && edge.data.target === node.data.id);
        if (cEdge === undefined) {
            return;
        }
        if (usableEdge(cEdge)) {
            if ('selectedOnce' in cEdge.data.class) {
                cEdge.addClass('selectedTwice')
            } else if (!('selectedTwice' in cEdge.data.class)) {
                cEdge.addClass('selectedOnce');
            }
            setCurrentColor(cEdge.data.color[1]);
            setCurrentNode(node);
        }
    };

    return (
        <div className="penrose-container">
            <button className="mode-back-btn" onClick={() => navigate('/railway-maze')}>&larr; Retour</button>
            <div className="penrose-top-bar">
                <select
                    className="mode-select"
                    value={selectedGraph}
                    onChange={handleGraphSelect}
                    disabled={loading}
                >
                    <option value="" disabled hidden>
                        {loading ? "Chargement des graphes..." : "Choisis un graphe"}
                    </option>
                    {graphs.length > 0 &&
                        graphs.map((graph) => (
                            /**@namespace graph._id*/
                            <option key={graph._id} value={graph._id}>
                                {graph.name}
                            </option>
                        ))
                    }
                </select>
                {error && <div className="error-message">{error}</div>}
                <TimerDisplay time={time} formatTime={formatTime} />
            </div>
            {currentGraph && <GraphDisplay graphData={currentGraph} cyRef={cyRef} onSelectNode={handleNodeSelect}/>}
        </div>
    )
};

export default Penrose;