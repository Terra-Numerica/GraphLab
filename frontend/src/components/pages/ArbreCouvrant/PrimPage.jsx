import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import GraphDisplay from './GraphDisplay';
import PrimVisualization from './PrimVisualization';
import '../../../styles/pages/ArbreCouvrant/PrimPage.css';

const PrimPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { graphId } = useParams();
    const cyRef = useRef(null);
    const [graph, setGraph] = useState(location.state?.graph || null);
    const [weightType, setWeightType] = useState(location.state?.weightType || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!graph && graphId) {
            setLoading(true);
            fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/graph/${graphId}`)
                .then(res => res.json())
                .then(data => {
                    setGraph(data);
                    setLoading(false);
                })
                .catch(() => {
                    setError('Impossible de charger le graphe.');
                    setLoading(false);
                });
        }
    }, [graph, graphId]);

    if (loading) return <div className="tree-mode-loading">Chargement...</div>;
    if (error) return <div className="tree-mode-error">{error}</div>;
    if (!graph) {
        return (
            <div className="tree-mode-container">
                <div className="tree-mode-error">
                    Aucun graphe n'a été sélectionné. Veuillez retourner à la page précédente.
                </div>
                <button className="tree-mode-back-btn" onClick={() => navigate('/arbre-couvrant')}>
                    Retour
                </button>
            </div>
        );
    }

    return (
        <div className="tree-mode-container">
            <button className="tree-mode-back-btn" onClick={() => navigate('/arbre-couvrant/try')}>
                &larr; Retour
            </button>
            <h2 className="tree-mode-title">Visualisation de l'algorithme de Prim</h2>
            <div className="tree-mode-top-bar prim-vertical">
                <div className="graph-info">
                    <span><strong>Graphe :</strong> {graph.name.split(' ')[1]}</span>
                    <span><strong>Type de poids :</strong> {
                        weightType
                            .replace('predefined', 'prédéfinis')
                            .replace('random', 'aléatoire')
                            .replace('one', 'tous à 1')
                    }</span>
                </div>
                <div className="prim-visualization-infos">
                    <PrimVisualization graph={graph} cyRef={cyRef} />
                </div>
            </div>
            <div className="prim-graph-centered">
                <div className="tree-mode-graph-area">
                    <GraphDisplay graphData={graph} cyRef={cyRef} />
                </div>
            </div>
        </div>
    );
};

export default PrimPage; 