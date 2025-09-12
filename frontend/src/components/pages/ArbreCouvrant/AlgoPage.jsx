import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

import AlgoVisualization from './AlgoVisualization';
import GraphDisplay from './GraphDisplay';
import RulesPopup from '../../../components/common/RulesPopup';

const algoConfig = {
  prim: {
    title: "Visualisation de l'algorithme de Prim",
    explanation: {
      title: "Algorithme de Prim",
      steps: [
        "L'algorithme de Prim construit l'arbre couvrant de poids minimal en partant d'un point de départ et en s'étendant progressivement.",
        "1. On commence par repérer le point de départ et on cherche l'arrête la moins chère qui le relie à un autre point",
        "2. On répète cette opération jusqu'à ce que tous les points soient connectés (On prends en compte chaque arrête où les sommets sont déjà connectés)",
        "3. On s'arrête quand tous les points sont connectés",
        "Cet algorithme est particulièrement utile quand on veut s'assurer d'utiliser toutes les arrêtes les moins chères possibles, car il explore localement les meilleures connexions à chaque étape."
      ]
    }
  },
  kruskal: {
    title: "Visualisation de l'algorithme de Kruskal",
    explanation: {
      title: "Algorithme de Kruskal",
      steps: [
        "L'algorithme de Kruskal construit l'arbre couvrant de poids minimal en examinant toutes les arrêtes possibles, de la moins chère à la plus chère.",
        "1. On commence par trier toutes les arrêtes par coût croissant",
        "2. On examine les arrêtes une par une, en commençant par la moins chère",
        "3. Pour chaque arrête, si elle ne crée pas de boucle dans le réseau, on l'ajoute, sinon on la rejette",
        "4. On s'arrête quand tous les points sont connectés",
        "Cet algorithme est particulièrement utile quand on veut s'assurer d'utiliser les arrêtes les moins chères possibles tout en évitant les connexions redondantes."
      ]
    }
  },
  boruvka: {
    title: "Visualisation de l'algorithme de Boruvka",
    explanation: {
      title: "Algorithme de Boruvka",
      steps: [
        "L'algorithme de Boruvka construit l'arbre couvrant de poids minimal en connectant progressivement des groupes de points entre eux.",
        "1. Au début, chaque point forme son propre groupe",
        "2. Pour chaque groupe de points, on sélectionne l'arrête la moins chère qui le connecte à un autre groupe",
        "3. On fusionne les groupes de points connectés",
        "4. On répète jusqu'à n'avoir qu'un seul groupe",
        "Cet algorithme est particulièrement efficace pour les grands réseaux car il peut traiter plusieurs connexions en parallèle à chaque étape."
      ]
    }
  },
  'exchange-property': {
    title: "Visualisation de l'algorithme de la propriété d'échange",
    explanation: {
      title: "Algorithme de la propriété d'échange",
      steps: [
        "L'algorithme de la propriété d'échange construit l'arbre couvrant de poids minimal en ajoutant les arêtes une par une et en appliquant la propriété d'échange dès qu'un cycle est détecté.",
        "1. On commence par trier toutes les arêtes par poids croissant",
        "2. On ajoute les arêtes une par une dans l'ordre croissant",
        "3. Dès qu'un cycle est détecté, on applique la propriété d'échange : on retire l'arête la plus lourde du cycle",
        "4. On continue jusqu'à avoir n-1 arêtes (arbre couvrant complet)",
        "Cet algorithme illustre parfaitement la propriété d'échange : dans tout cycle, l'arête la plus lourde ne peut pas faire partie d'un arbre couvrant minimal."
      ]
    }
  }
};

const AlgoExplanation = ({ algo, onClose }) => {
  const explanation = algoConfig[algo]?.explanation;

  return (
    <RulesPopup onClose={onClose} title={explanation?.title || "Explication de l'algorithme"}>
      <div className="algo-explanation">
        <div className="explanation-steps">
          {explanation?.steps.map((step, index) => (
            <p key={index}>{step}</p>
          ))}
        </div>
      </div>
    </RulesPopup>
  );
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
  const [showExplanation, setShowExplanation] = useState(false);

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
          Aucun graphe n'a été selectionné. Tu peux retourner à la page précédente pour en selectionner un.
        </div>
        <button className="tree-mode-back-btn" onClick={() => navigate('/arbre-couvrant')}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="tree-mode-container">
      <button className="tree-mode-back-btn" onClick={() => navigate('/arbre-couvrant/try', {
        state: {
          selectedGraph: graphId,
          weightType: weightType
        }
      })}>
        &larr; Retour
      </button>
      {showExplanation && (
        <AlgoExplanation
          algo={algo}
          onClose={() => setShowExplanation(false)}
        />
      )}
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

          <button
            className="tree-mode-btn"
            onClick={() => setShowExplanation(true)}
          >
            Comprendre l'algorithme
          </button>
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