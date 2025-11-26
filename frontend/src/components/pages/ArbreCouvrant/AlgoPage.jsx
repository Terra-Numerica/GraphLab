import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback } from 'react';

import AlgoVisualization from './AlgoVisualization';
import GraphDisplay from './GraphDisplay';
import RulesPopup from '../../../components/common/RulesPopup';
import config from '../../../config';

const algoConfig = {
  prim: {
    title: "Visualisation de l'algorithme de Prim",
    explanation: {
      title: "Algorithme de Prim",
      steps: [
        "L'algorithme de Prim construit l'arbre couvrant de poids minimal en faisant grandir progressivement une composante à laquelle on ajoute un sommet à chaque étape.",
        "1. On commence par mettre un sommet quelconque dans la composante en construction.",
        "2. À chaque étape, on repère l'arête la moins chère reliant la composante en construction à un sommet hors de cette composante. On ajoute cette arête et son extrémité dans la composante en construction.",
        "3. On s'arrête quand tous les sommets sont dans la composante en construction."
      ]
    }
  },
  kruskal: {
    title: "Visualisation de l'algorithme de Kruskal",
    explanation: {
      title: "Algorithme de Kruskal",
      steps: [
        "L'algorithme de Kruskal construit l'arbre couvrant de poids minimal en examinant toutes les arêtes de la moins chère à la plus chère, et en les ajoutant ensuite une à une si nécessaire.",
        "1. On commence par trier toutes les arêtes par coût croissant",
        "2. On examine les arêtes une par une, en commençant par la moins chère",
        "3. Pour chaque arête, si elle ne crée pas de cycle dans le réseau, on l'ajoute, sinon on la rejette",
        "4. On s'arrête quand toutes les arêtes ont été examinées."
      ]
    }
  },
  boruvka: {
    title: "Visualisation de l'algorithme de Boruvka",
    explanation: {
      title: "Algorithme de Boruvka",
      steps: [
        "L'algorithme de Boruvka construit l'arbre couvrant de poids minimal en connectant progressivement des composantes entre elles.",
        "1. Au début, chaque sommet forme sa propre composante.",
        "2. À chaque étape, on sélectionne pour chaque composante l'arête la moins chère qui la connecte à une autre composante, et on ajoute ces arêtes.",
        "3. On s'arrête quand il n'y a plus qu'une composante.",
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
        "1. On commence par faire une liste des arêtes (dans un ordre arbitraire).",
        "2. On ajoute les arêtes une par une dans l'arbre couvrant suivant l'ordre de la liste.",
        "3. À chaque étape, si l'ajout de l'arête crée un cycle, on cherche l'arête la plus lourde de ce cycle et on l'enlève de l'arbre couvrant.",
        "4. On continue quand on a fini la liste.",
        "Cet algorithme est basé sur la propriété d'échange : dans tout cycle, l'arête la plus lourde ne peut pas faire partie d'un arbre couvrant minimal."
      ]
    }
  }
};

const AlgoExplanation = ({ algo, onClose }) => {
  const explanation = algoConfig[algo]?.explanation;

  return (
    <RulesPopup onClose={onClose} title={explanation?.title || "Explication de l'algorithme"}>
      <div className="p-4">
        <div className="flex flex-col gap-4">
          {explanation?.steps.map((step, index) => (
            <p key={index} className="m-0 leading-relaxed text-astro">{step}</p>
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
  const [disconnectedComponents, setDisconnectedComponents] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);

  const config = algoConfig[algo];

  // Fonction pour détecter les composantes connectées
  const findConnectedComponents = useCallback((edges, nodes) => {
    // Créer la liste d'adjacence
    const adjacencyList = {};
    nodes.forEach(node => {
      adjacencyList[node.data.id] = [];
    });
    
    edges.forEach(edge => {
      adjacencyList[edge.data.source].push(edge.data.target);
      adjacencyList[edge.data.target].push(edge.data.source);
    });
    
    const visited = new Set();
    const components = [];
    
    const dfs = (node, component) => {
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
        const component = [];
        dfs(node.data.id, component);
        components.push(component);
      }
    }
    
    return components;
  }, []);

  // Fonction pour formater les composantes selon le nouveau format
  const formatComponents = useCallback((components, nodes) => {
    if (components.length === 0) return '';
    
    // Trier les composantes : d'abord les composantes connectées (taille > 1), puis les isolées (taille = 1)
    const sortedComponents = [...components].sort((a, b) => {
      if (a.length > 1 && b.length === 1) return -1; // Composantes connectées en premier
      if (a.length === 1 && b.length > 1) return 1;  // Composantes isolées en dernier
      return a.length - b.length; // Sinon trier par taille
    });
    
    // Convertir chaque composante en format (N1, N2, ...)
    const formattedComponents = sortedComponents.map(component => {
      const nodeLabels = component.map(nodeId => {
        const node = nodes.find(n => n.data.id === nodeId);
        return node ? node.data.label || nodeId : nodeId;
      });
      return `(${nodeLabels.join(', ')})`;
    });
    
    return formattedComponents.join(' ~ ');
  }, []);

  useEffect(() => {
    if (!graph && graphId) {
      setLoading(true);
      fetch(`${config.apiUrl}/graph/${graphId}`)
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
  const handleSelectedEdgesChange = useCallback((edges) => {
    setSelectedEdges(edges);
  }, []);

  if (!config) return <div className="p-4 text-center text-red">Algorithme inconnu</div>;
  if (loading) return <div className="flex h-screen items-center justify-center text-lg text-gray-600">Chargement...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-lg text-red">{error}</div>;
  if (!graph) {
    return (
      <div className="w-full bg-gray-100 px-4 sm:px-8 md:px-16 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg bg-red/10 px-3 py-2 text-sm font-medium text-red">
          Aucun graphe n'a été selectionné. Tu peux retourner à la page précédente pour en selectionner un.
          </div>
          <button 
            className="mt-4 inline-flex items-center gap-2 rounded-xl border-2 border-blue px-4 py-2 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
            onClick={() => navigate('/arbre-couvrant')}
          >
            <span aria-hidden="true">←</span> Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 px-4 sm:px-8 md:px-16 py-8">
      <div className="mx-auto w-full max-w-full">
        {/* Back button */}
        <button 
          className="inline-flex items-center gap-2 rounded-xl border-2 border-blue px-4 py-2 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
          onClick={() => navigate('/arbre-couvrant/try', {
        state: {
          selectedGraph: graphId,
          weightType: weightType
        }
          })}
        >
          <span aria-hidden="true">←</span> Retour
      </button>

        {/* Explanation popup */}
      {showExplanation && (
        <AlgoExplanation
          algo={algo}
          onClose={() => setShowExplanation(false)}
        />
      )}

        {/* Title */}
        <h2 className="mt-4 text-center text-3xl md:text-4xl font-bold text-darkBlue">{config.title}</h2>

        {/* Top bar with graph info and visualization */}
        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow">
          {/* Graph info */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Gauche : Graphe, Type de poids & Algorithme */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-darkBlue shadow-sm">
                <strong>Graphe :</strong> <span className="font-semibold ml-1">{graph.name.split(' ')[1]}</span>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-darkBlue shadow-sm">
                <strong>Type de poids :</strong> <span className="font-semibold ml-1">{
            weightType
              ?.replace('predefined', 'prédéfinis')
              .replace('random', 'aléatoire')
              .replace('one', 'tous à 1')
          }</span>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-darkBlue shadow-sm">
                Algorithme : <span className="font-semibold capitalize ml-1">{algo.replace('-', ' ')}</span>
              </div>
            </div>

            {/* Droite : Comprendre l'algorithme */}
          <button
              className="inline-flex items-center justify-center rounded-xl border-2 border-blue px-5 py-2.5 text-sm font-semibold text-blue hover:bg-blue hover:text-white transition focus:outline-none focus:ring-2 focus:ring-blue/40"
            onClick={() => setShowExplanation(true)}
          >
            Comprendre l'algorithme
          </button>
        </div>

          {/* Visualization controls */}
          <div className="mt-4 border-t border-gray-200 pt-4">
          <AlgoVisualization 
            algo={algo} 
            graph={graph} 
            cyRef={cyRef} 
            onSelectedEdgesChange={handleSelectedEdgesChange}
              graphDisplay={<GraphDisplay graphData={graph} cyRef={cyRef} />}
              componentsInfo={graph && disconnectedComponents.length > 0 ? formatComponents(disconnectedComponents, graph.data.nodes) : null}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgoPage; 