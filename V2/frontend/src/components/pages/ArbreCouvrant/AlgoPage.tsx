import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Graph, Node, Edge } from '../../../types';

import AlgoVisualization from './AlgoVisualization';
import GraphDisplay from './GraphDisplay';
import RulesPopup from '../../../components/common/RulesPopup';

const algoConfig = {
  prim: {
    title: "Visualisation de l'algorithme de Prim",
    explanation: {
      title: "Algorithme de Prim",
      steps: [
        "L'algorithme de Prim construit l'arbre couvrant de poids minimal en partant d'une composante de départ et en s'étendant progressivement.",
        "1. On commence par repérer la composante de départ et on cherche l'arête la moins chère qui le relie à une autre composante",
        "2. On répète cette opération jusqu'à ce que toutes les composantes soient connectées (On prends en compte chaque arête où les composantes sont déjà connectés)",
        "3. On s'arête quand toutes les composantes sont connectées",
        "Cet algorithme est particulièrement utile quand on veut s'assurer d'utiliser toutes les arêtes les moins chères possibles, car il explore localement les meilleures connexions à chaque étape."
      ]
    }
  },
  kruskal: {
    title: "Visualisation de l'algorithme de Kruskal",
    explanation: {
      title: "Algorithme de Kruskal",
      steps: [
        "L'algorithme de Kruskal construit l'arbre couvrant de poids minimal en examinant toutes les arêtes possibles, de la moins chère à la plus chère.",
        "1. On commence par trier toutes les arêtes par coût croissant",
        "2. On examine les arêtes une par une, en commençant par la moins chère",
        "3. Pour chaque arête, si elle ne crée pas de boucle dans le réseau, on l'ajoute, sinon on la rejette",
        "4. On s'arête quand toutes les composantes sont connectées",
        "Cet algorithme est particulièrement utile quand on veut s'assurer d'utiliser les arêtes les moins chères possibles tout en évitant les connexions redondantes."
      ]
    }
  },
  boruvka: {
    title: "Visualisation de l'algorithme de Boruvka",
    explanation: {
      title: "Algorithme de Boruvka",
      steps: [
        "L'algorithme de Boruvka construit l'arbre couvrant de poids minimal en connectant progressivement des groupes de composantes entre eux.",
        "1. Au début, chaque composante forme son propre groupe",
        "2. Pour chaque groupe de composantes, on sélectionne l'arête la moins chère qui le connecte à un autre groupe",
        "3. On fusionne les groupes de composantes connectées",
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

const AlgoExplanation: React.FC<{ algo: string; onClose: () => void }> = ({ algo, onClose }) => {
  const explanation = algoConfig[algo as keyof typeof algoConfig]?.explanation;

  return (
    <RulesPopup onClose={onClose} title={explanation?.title || "Explication de l'algorithme"}>
      <div className="algo-explanation">
        <div className="explanation-steps">
          {explanation?.steps.map((step: string, index: number) => (
            <p key={index}>{step}</p>
          ))}
        </div>
      </div>
    </RulesPopup>
  );
};

const AlgoPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { algo, graphId } = useParams();
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [graph, setGraph] = useState<Graph | null>(location.state?.graph || null);
  const [weightType] = useState<string | null>(location.state?.weightType || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [disconnectedComponents, setDisconnectedComponents] = useState<string[][]>([]);
  const [selectedEdges, setSelectedEdges] = useState<Edge[]>([]);

  const config = algo ? algoConfig[algo as keyof typeof algoConfig] : null;

  // Fonction pour détecter les composantes connectées
  const findConnectedComponents = useCallback((edges: Edge[], nodes: Node[]) => {
    // Créer la liste d'adjacence
    const adjacencyList: Record<string, string[]> = {};
    nodes.forEach((node: Node) => {
      adjacencyList[node.data.id] = [];
    });
    
    edges.forEach((edge: Edge) => {
      adjacencyList[edge.data.source].push(edge.data.target);
      adjacencyList[edge.data.target].push(edge.data.source);
    });
    
    const visited = new Set<string>();
    const components: string[][] = [];
    
    const dfs = (node: string, component: string[]): void => {
      visited.add(node);
      component.push(node);
      
      for (const neighbor of adjacencyList[node]) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, component);
        }
      }
    };
    
    // Trouver toutes les composantes connectées
    for (const node of nodes) {
      if (!visited.has(node.data.id)) {
        const component: string[] = [];
        dfs(node.data.id, component);
        components.push(component);
      }
    }
    
    return components;
  }, []);

  // Fonction pour formater les composantes selon le nouveau format
  const formatComponents = useCallback((components: string[][], nodes: Node[]) => {
    if (components.length === 0) return '';
    
    // Trier les composantes : d'abord les composantes connectées (taille > 1), puis les isolées (taille = 1)
    const sortedComponents = [...components].sort((a: string[], b: string[]) => {
      if (a.length > 1 && b.length === 1) return -1; // Composantes connectées en premier
      if (a.length === 1 && b.length > 1) return 1;  // Composantes isolées en dernier
      return a.length - b.length; // Sinon trier par taille
    });
    
    // Convertir chaque composante en format (N1, N2, ...)
    const formattedComponents = sortedComponents.map((component: string[]) => {
      const nodeLabels = component.map((nodeId: string) => {
        const node = nodes.find((n: Node) => n.data.id === nodeId);
        return node ? node.data.label || nodeId : nodeId;
      });
      return `(${nodeLabels.join(', ')})`;
    });
    
    return formattedComponents.join(' ~ ');
  }, []);

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

  // Calculer les composantes connectées basées sur les arêtes sélectionnées
  useEffect(() => {
    if (graph && graph.data) {
      const components = findConnectedComponents(selectedEdges, graph.data.nodes);
      setDisconnectedComponents(components);
    }
  }, [graph, selectedEdges, findConnectedComponents]);

  // Callback pour recevoir les arêtes sélectionnées depuis AlgoVisualization
  const handleSelectedEdgesChange = useCallback((edges: Edge[]) => {
    setSelectedEdges(edges);
  }, []);

  if (!config) return <div>Algorithme inconnu</div>;
  if (loading) return <div className="workshop-loading">Chargement...</div>;
  if (error) return <div className="workshop-error">{error}</div>;
  if (!graph) {
    return (
      <div className="arbre-couvrant-container">
        <div className="workshop-error-message">
          Aucun graphe n'a été selectionné. Tu peux retourner à la page précédente pour en selectionner un.
        </div>
        <button className="workshop-back-btn" onClick={() => navigate('/arbre-couvrant')}>
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="arbre-couvrant-container">
      <button className="workshop-back-btn" onClick={() => navigate('/arbre-couvrant/try', {
        state: {
          selectedGraph: graphId,
          weightType: weightType
        }
      })}>
        &larr; Retour
      </button>
      {showExplanation && algo && (
        <AlgoExplanation
          algo={algo}
          onClose={() => setShowExplanation(false)}
        />
      )}
      <h2 className="workshop-title">{config.title}</h2>
      <div className={`workshop-top-bar algo-vertical`}>
        <div className="workshop-graph-info">
          <span><strong>Graphe :</strong> {graph.name.split(' ')[1]}</span>
          <span><strong>Type de poids :</strong> {
            weightType
              ?.replace('predefined', 'prédéfinis')
              .replace('random', 'aléatoire')
              .replace('one', 'tous à 1')
          }</span>

          <button
            className="workshop-btn"
            onClick={() => setShowExplanation(true)}
          >
            Comprendre l'algorithme
          </button>
        </div>

        <div className="algo-visualization-infos">
          {algo && (
            <AlgoVisualization 
              algo={algo} 
              graph={graph} 
              cyRef={cyRef} 
              onSelectedEdgesChange={handleSelectedEdgesChange}
            />
          )}
        </div>
      </div>
      {disconnectedComponents.length > 0 && graph && (
          <div className="arbre-couvrant-components-error">
            <div className="arbre-couvrant-components-error-text">
              <div style={{ marginTop: '0.5rem' }}>
                <strong>Composantes :</strong> {formatComponents(disconnectedComponents, graph.data.nodes)}
              </div>
            </div>
          </div>
        )}
      <div className="algo-graph-centered">
        <div className="workshop-graph-area">
          <GraphDisplay graphData={graph} cyRef={cyRef} onSelectEdge={() => {}} />
        </div>
      </div>
      <div className="algo-bottom-actions">
        <button className="workshop-back-btn" onClick={() => navigate('/arbre-couvrant/try', {
          state: {
            selectedGraph: graphId,
            weightType: weightType
          }
        })}>
          &larr; Retour
        </button>
      </div>
    </div>
  );
};

export default AlgoPage; 