import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

import AlgoVisualization from './AlgoVisualization';
import GraphDisplay from './GraphDisplay';

const algoConfig = {
  prim: { title: "Visualisation de l'algorithme de Prim" },
  kruskal: { title: "Visualisation de l'algorithme de Kruskal" },
  boruvka: { title: "Visualisation de l'algorithme de Boruvka" }
};

const AlgoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { algo, graphId } = useParams();
  const cyRef = useRef(null);
  const [graph, setGraph] = useState(location.state?.graph || null);
  const [weightType, setWeightType] = useState(location.state?.weightType || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const config = algoConfig[algo];

  useEffect(() => {
    if (!graph && graphId) {
      setLoading(true);
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/graph/${graphId}`)
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

  if (!config) return <div>Algorithme inconnu</div>;
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
      <h2 className="tree-mode-title">{config.title}</h2>
      <div className={`tree-mode-top-bar algo-vertical`}>
        <div className="graph-info">
          <span><strong>Graphe :</strong> {graph.name.split(' ')[1]}</span>
          <span><strong>Type de poids :</strong> {
            weightType
              ?.replace('predefined', 'prédéfinis')
              .replace('random', 'aléatoire')
              .replace('one', 'tous à 1')
          }</span>
        </div>
        <div className="algo-visualization-infos">
          <AlgoVisualization algo={algo} graph={graph} cyRef={cyRef} />
        </div>
      </div>
      <div className="algo-graph-centered">
        <div className="tree-mode-graph-area">
          <GraphDisplay graphData={graph} cyRef={cyRef} />
        </div>
      </div>
    </div>
  );
};

export default AlgoPage; 