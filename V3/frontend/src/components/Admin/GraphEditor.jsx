import { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import config from '../../config';
import { colors } from '../../utils/colorPalette';

// ❌ supprimé : import '../../styles/Admin/GraphEditor.css';

const GraphEditor = ({ graphId = null, onClose }) => {
    const [graphData, setGraphData] = useState({
        name: '',
        data: {
            nodes: [],
            edges: []
        },
        workshopData: {
            coloring: {
                enabled: false,
                difficulty: 'Facile',
                optimalCount: 0,
                tabletCounts: {}
            },
            spanningTree: {
                enabled: false,
                difficulty: 'Facile',
                weightType: 'predefined', // predefined, random, unit
                algorithmType: 'all' // all, prim, kruskal, boruvka
            },
            railwayMaze: {
                enabled: false,
                difficulty: 'Facile',
                startNode: '',
                endNode: '',
                colorRules: {
                    orange: [],
                    blue: []
                }
            }
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('graph');
    const containerRef = useRef(null);
    const cyRef = useRef(null);
    const selectedNodeRef = useRef(null);

    useEffect(() => {
        if (graphId) {
            fetchGraph();
        }
    }, [graphId]);

    // Gérer le scroll du body quand le modal est ouvert
    useEffect(() => {
        // Empêcher le scroll du body
        document.body.classList.add('modal-open');
        
        // Nettoyer quand le composant est démonté
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, []);

    const fetchGraph = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.apiUrl}/graph/${graphId}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du graphe');
            }
            const data = await response.json();
            
            // Adapter la structure pour les graphes existants
            const optimalCount = data.workshopData?.coloring?.optimalCount || 0;
            const colorNames = ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Violet', 'Rose', 'Vert lime', 'Gris foncé', 'Marron', 'Cyan clair', 'Orange vif', 'Vert néon', 'Bleu clair'];
            
            // Fonction pour convertir un code hex en nom de couleur
            const hexToColorName = (hex) => {
                const index = colors.indexOf(hex);
                return index !== -1 ? colorNames[index] : null;
            };
            
            // Nettoyer les tabletCounts pour ne garder que les couleurs correspondant à optimalCount
            const cleanedTabletCounts = {};
            if (optimalCount > 0) {
                for (let i = 0; i < optimalCount; i++) {
                    const colorName = colorNames[i] || `Couleur ${i + 1}`;
                    const colorHex = colors[i];
                    
                    // Chercher la valeur soit par nom de couleur, soit par code hex
                    let count = 0;
                    if (data.workshopData?.coloring?.tabletCounts) {
                        count = data.workshopData.coloring.tabletCounts[colorName] || 
                                data.workshopData.coloring.tabletCounts[colorHex] || 0;
                    }
                    
                    cleanedTabletCounts[colorName] = count;
                }
            }
            
            // S'assurer que les nœuds ont toutes les propriétés requises
            const validatedNodes = (data.data?.nodes || []).map(node => ({
                data: {
                    id: node.data?.id || '',
                    label: node.data?.label || ''
                },
                position: {
                    x: node.position?.x || 0,
                    y: node.position?.y || 0
                },
                group: node.group || 'nodes',
                removed: node.removed || false,
                selected: node.selected || false,
                selectable: node.selectable !== undefined ? node.selectable : true,
                locked: node.locked || false,
                grabbable: node.grabbable !== undefined ? node.grabbable : true,
                pannable: node.pannable !== undefined ? node.pannable : true,
                classes: node.classes || ''
            }));
            
            const adaptedData = {
                name: data.name || '',
                data: {
                    nodes: validatedNodes,
                    edges: data.data?.edges || []
                },
                workshopData: {
                    coloring: {
                        enabled: data.workshopData?.coloring?.enabled || false,
                        difficulty: data.workshopData?.coloring?.difficulty || 'Facile',
                        optimalCount: optimalCount,
                        tabletCounts: cleanedTabletCounts
                    },
                    spanningTree: {
                        enabled: data.workshopData?.spanningTree?.enabled || false,
                        difficulty: data.workshopData?.spanningTree?.difficulty || 'Facile',
                        weightType: data.workshopData?.spanningTree?.weightType || 'predefined',
                        algorithmType: data.workshopData?.spanningTree?.algorithmType || 'all'
                    },
                    railwayMaze: {
                        enabled: data.workshopData?.railwayMaze?.enabled || false,
                        difficulty: data.workshopData?.railwayMaze?.difficulty || 'Facile',
                        startNode: data.workshopData?.railwayMaze?.startNode || '',
                        endNode: data.workshopData?.railwayMaze?.endNode || '',
                        colorRules: data.workshopData?.railwayMaze?.colorRules || {
                            orange: [],
                            blue: []
                        }
                    }
                }
            };
            
            setGraphData(adaptedData);
        } catch (err) {
            setError('Impossible de charger le graphe.');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!containerRef.current || activeTab !== 'graph') return;

        if (cyRef.current) {
            cyRef.current.destroy();
            cyRef.current = null;
        }

        const cy = cytoscape({
            container: containerRef.current,
            elements: {
                nodes: graphData.data.nodes.map(node => ({
                    group: 'nodes',
                    data: {
                        id: node.data.id,
                        color: node.data.color || '#cccccc'
                    },
                    position: node.position
                })),
                edges: graphData.data.edges.map(edge => ({
                    data: {
                        ...edge.data,
                        controlPointDistance: edge.data.controlPointDistance || 0
                    }
                }))
            },
            style: [
                {
                    selector: 'node',
                    style: {
                        'background-color': 'data(color)',
                        'border-width': 2,
                        'border-color': '#666'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        'line-color': '#666',
                        'width': 2,
                        'curve-style': 'unbundled-bezier',
                        'control-point-distance': 'data(controlPointDistance)',
                        'control-point-weight': 0.5
                    }
                }
            ],
            layout: { name: 'preset' },
            zoomingEnabled: false,
            panningEnabled: false,
            boxSelectionEnabled: false
        });

        // Gestion des clics sur les nœuds pour créer des arêtes
        cy.on('tap', 'node', (evt) => {
            const node = evt.target;
            if (selectedNodeRef.current) {
                if (selectedNodeRef.current === node) {
                    selectedNodeRef.current.style('border-color', '#666');
                    selectedNodeRef.current = null;
                } else {
                    const newEdge = {
                        data: {
                            id: `e${selectedNodeRef.current.id()}-${node.id()}`,
                            source: selectedNodeRef.current.id(),
                            target: node.id(),
                            controlPointDistance: 0
                        }
                    };
                    // Ajouter l'arête directement à Cytoscape
                    cyRef.current.add({
                        data: {
                            id: newEdge.data.id,
                            source: newEdge.data.source,
                            target: newEdge.data.target,
                            controlPointDistance: newEdge.data.controlPointDistance
                        }
                    });
                    
                    setGraphData(prev => ({
                        ...prev,
                        data: {
                            ...prev.data,
                            edges: [...prev.data.edges, newEdge]
                        }
                    }));
                    selectedNodeRef.current.style('border-color', '#666');
                    selectedNodeRef.current = null;
                }
            } else {
                selectedNodeRef.current = node;
                node.style('border-color', '#FFD700');
            }
        });

        // Clic droit pour supprimer
        cy.on('cxttap', 'node, edge', (evt) => {
            evt.preventDefault();
            const element = evt.target;
            if (element.isNode()) {
                // Supprimer le nœud et ses arêtes de Cytoscape
                element.remove();
                
                setGraphData(prev => ({
                    ...prev,
                    data: {
                        nodes: prev.data.nodes.filter(node => node.data.id !== element.id()),
                        edges: prev.data.edges.filter(edge =>
                            edge.data.source !== element.id() && edge.data.target !== element.id()
                        )
                    }
                }));
            } else if (element.isEdge()) {
                // Supprimer l'arête de Cytoscape
                element.remove();
                
                setGraphData(prev => ({
                    ...prev,
                    data: {
                        ...prev.data,
                        edges: prev.data.edges.filter(edge => edge.data.id !== element.id())
                    }
                }));
            }
        });

        // Clic sur le fond pour désélectionner
        cy.on('tap', (evt) => {
            if (evt.target === cy) {
                if (selectedNodeRef.current) {
                    selectedNodeRef.current.style('border-color', '#666');
                    selectedNodeRef.current = null;
                }
            }
        });

        cyRef.current = cy;

        return () => {
            if (cyRef.current) {
                cyRef.current.destroy();
                cyRef.current = null;
            }
        };
    }, [activeTab, graphData.data.nodes, graphData.data.edges]);

    const handleAddNode = () => {
        if (!cyRef.current) return;
        
        const newNodeId = `node-${Date.now()}`;
        const newNode = {
            data: {
                id: newNodeId,
                label: `n${graphData.data.nodes.length + 1}`
            },
            position: {
                x: Math.random() * 600 + 100,
                y: Math.random() * 300 + 100
            },
            group: 'nodes',
            removed: false,
            selected: false,
            selectable: true,
            locked: false,
            grabbable: true,
            pannable: true,
            classes: ''
        };
        
        // Ajouter le nœud directement à Cytoscape
        cyRef.current.add({
            group: 'nodes',
            data: {
                id: newNodeId,
                color: '#cccccc'
            },
            position: newNode.position
        });
        
        // Mettre à jour le state
        setGraphData(prev => ({
            ...prev,
            data: {
                ...prev.data,
                nodes: [...prev.data.nodes, newNode]
            }
        }));
    };

    const resetGraph = () => {
        if (cyRef.current) {
            cyRef.current.elements().remove();
        }
        setGraphData(prev => ({
            ...prev,
            data: {
                nodes: [],
                edges: []
            }
        }));
    };

    const rearrangeGraph = () => {
        if (cyRef.current) {
            const layoutOptions = {
                name: 'circle',
                fit: true,
                padding: 30,
                avoidOverlap: true,
                spacingFactor: 1.5
            };
            cyRef.current.layout(layoutOptions).run();
            // Mettre à jour les positions dans l'état
            const nodes = cyRef.current.nodes().map(node => ({
                group: 'nodes',
                data: node.data(),
                position: node.position()
            }));
            setGraphData(prev => ({
                ...prev,
                data: {
                    ...prev.data,
                    nodes
                }
            }));
        }
    };

    // Gestion des ateliers
    const toggleWorkshop = (workshopName) => {
        setGraphData(prev => ({
            ...prev,
            workshopData: {
                ...prev.workshopData,
                [workshopName]: {
                    ...prev.workshopData[workshopName],
                    enabled: !prev.workshopData[workshopName]?.enabled
                }
            }
        }));
    };

    const updateWorkshopConfig = (workshopName, field, value) => {
        setGraphData(prev => {
            const newData = {
                ...prev,
                workshopData: {
                    ...prev.workshopData,
                    [workshopName]: {
                        ...prev.workshopData[workshopName],
                        [field]: value
                    }
                }
            };

            // Si on change le nombre optimal de couleurs, auto-compléter les compteurs
            if (workshopName === 'coloring' && field === 'optimalCount') {
                const optimalCount = parseInt(value) || 0;
                const availableColors = colors.slice(0, optimalCount);
                const colorNames = ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Violet', 'Rose', 'Vert lime', 'Gris foncé', 'Marron', 'Cyan clair', 'Orange vif', 'Vert néon', 'Bleu clair'];
                
                // Auto-compléter avec des valeurs par défaut
                const autoTabletCounts = {};
                availableColors.forEach((_, index) => {
                    const colorName = colorNames[index] || `Couleur ${index + 1}`;
                    autoTabletCounts[colorName] = 0; // Valeur par défaut
                });
                
                newData.workshopData.coloring.tabletCounts = autoTabletCounts;
            }

            return newData;
        });
    };

    const updateTabletCount = (color, count) => {
        const newCount = Math.max(0, parseInt(count) || 0);
        const maxNodes = graphData.data.nodes.length;
        const currentCount = graphData.workshopData.coloring.tabletCounts[color] || 0;
        
        // Calculer le total actuel des autres couleurs (sans la couleur modifiée)
        const otherColorsTotal = Object.entries(graphData.workshopData.coloring.tabletCounts || {})
            .filter(([colorName]) => colorName !== color)
            .reduce((sum, [, val]) => sum + (val || 0), 0);
        
        // Calculer le maximum possible pour cette couleur
        const maxForThisColor = Math.max(0, maxNodes - otherColorsTotal);
        
        // Limiter le nombre de pastilles
        const limitedCount = Math.min(newCount, maxForThisColor);
        
        setGraphData(prev => ({
            ...prev,
            workshopData: {
                ...prev.workshopData,
                coloring: {
                    ...prev.workshopData.coloring,
                    tabletCounts: {
                        ...prev.workshopData.coloring.tabletCounts,
                        [color]: limitedCount
                    }
                }
            }
        }));
    };

    // Calculer le total des pastilles
    const getTotalTablets = () => {
        // Ne compter que les couleurs actuellement affichées
        const availableColors = getAvailableColors();
        const colorNames = ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Violet', 'Rose', 'Vert lime', 'Gris foncé', 'Marron', 'Cyan clair', 'Orange vif', 'Vert néon', 'Bleu clair'];
        
        let total = 0;
        availableColors.forEach((_, index) => {
            const colorName = colorNames[index] || `Couleur ${index + 1}`;
            total += graphData.workshopData.coloring.tabletCounts[colorName] || 0;
        });
        
        return total;
    };

    // Obtenir les couleurs disponibles selon le nombre optimal
    const getAvailableColors = () => {
        const optimalCount = graphData.workshopData.coloring.optimalCount || 0;
        return colors.slice(0, optimalCount);
    };

    // Sauvegarder les positions des nœuds depuis Cytoscape
    const saveNodePositions = () => {
        if (cyRef.current) {
            const updatedNodes = graphData.data.nodes.map(node => {
                const cyNode = cyRef.current.getElementById(node.data.id);
                if (cyNode && cyNode.length > 0) {
                    const position = cyNode.position();
                    return {
                        ...node,
                        position: { x: position.x, y: position.y }
                    };
                }
                return node;
            });
            
            setGraphData(prev => ({
                ...prev,
                data: {
                    ...prev.data,
                    nodes: updatedNodes
                }
            }));
        }
    };

    // Gérer le changement d'onglet
    const handleTabChange = (newTab) => {
        // Sauvegarder les positions avant de changer d'onglet
        if (activeTab === 'graph') {
            saveNodePositions();
        }
        setActiveTab(newTab);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Sauvegarder les positions avant l'envoi
            if (activeTab === 'graph') {
                saveNodePositions();
            }
            
            // Validation côté frontend selon le modèle de base de données
            
            // Validation du nom (requis, 2-50 caractères)
            if (!graphData.name || graphData.name.trim().length < 2) {
                setError('Le nom du graphe doit contenir au moins 2 caractères.');
                setLoading(false);
                return;
            }
            
            if (graphData.name.length > 50) {
                setError('Le nom du graphe ne peut pas dépasser 50 caractères.');
                setLoading(false);
                return;
            }
            
            // Validation du graphe (au moins un nœud)
            if (!graphData.data.nodes || graphData.data.nodes.length === 0) {
                setError('Le graphe doit contenir au moins un nœud.');
                setLoading(false);
                return;
            }
            
            if (graphData.workshopData.coloring.enabled) {
                const optimalCount = graphData.workshopData.coloring.optimalCount || 0;
                if (optimalCount < 1) {
                    setError('Le nombre optimal de couleurs doit être au moins 1 pour activer la coloration.');
                    setLoading(false);
                    return;
                }
                
                // Vérifier que tous les compteurs sont des entiers positifs
                const tabletCounts = graphData.workshopData.coloring.tabletCounts || {};
                const invalidCounts = Object.entries(tabletCounts).filter(([_, count]) => 
                    typeof count !== 'number' || count < 0 || !Number.isInteger(count)
                );
                
                if (invalidCounts.length > 0) {
                    setError('Les compteurs de pastilles doivent être des nombres entiers positifs.');
                    setLoading(false);
                    return;
                }
            }
            
            // Nettoyer les données avant l'envoi
            const cleanedData = {
                name: graphData.name,
                data: graphData.data,
                workshopData: {}
            };

            // Ajouter seulement les ateliers activés selon le modèle de base de données
            
            // Coloration - respecter la validation du modèle
            if (graphData.workshopData.coloring.enabled) {
                const optimalCount = graphData.workshopData.coloring.optimalCount || 0;
                
                // Le modèle exige optimalCount >= 1, mais nous permettons 0
                // Si optimalCount = 0, on ne sauvegarde pas l'atelier
                if (optimalCount >= 1) {
                    // Convertir les noms de couleurs en codes hex pour la sauvegarde
                    const colorNames = ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Violet', 'Rose', 'Vert lime', 'Gris foncé', 'Marron', 'Cyan clair', 'Orange vif', 'Vert néon', 'Bleu clair'];
                    const hexTabletCounts = {};
                    
                    Object.entries(graphData.workshopData.coloring.tabletCounts || {}).forEach(([colorName, count]) => {
                        const colorIndex = colorNames.indexOf(colorName);
                        if (colorIndex !== -1) {
                            hexTabletCounts[colors[colorIndex]] = count;
                        }
                    });
                    
                    cleanedData.workshopData.coloring = {
                        enabled: true,
                        difficulty: graphData.workshopData.coloring.difficulty,
                        optimalCount: optimalCount,
                        tabletCounts: hexTabletCounts
                    };
                }
            }

            // SpanningTree - selon le modèle, seul 'enabled' est défini
            if (graphData.workshopData.spanningTree.enabled) {
                cleanedData.workshopData.spanningTree = {
                    enabled: true
                };
            }

            // RailwayMaze - selon le modèle, seul 'enabled' est défini
            if (graphData.workshopData.railwayMaze.enabled) {
                cleanedData.workshopData.railwayMaze = {
                    enabled: true
                };
            }

            const url = graphId
                ? `${config.apiUrl}/graph/${graphId}`
                : `${config.apiUrl}/graph`;

            const method = graphId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedData)
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la sauvegarde du graphe');
            }

            onClose();
        } catch (err) {
            setError('Erreur lors de la sauvegarde du graphe');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-8">
                <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
                    <div className="w-8 h-8 border-4 border-blue/30 border-t-blue rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xl text-darkBlue font-medium">Chargement du graphe...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-8">
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-4 p-6 bg-red/10 border border-red/20 rounded-xl">
                        <div className="text-3xl">⚠️</div>
                        <div>
                            <h3 className="text-lg font-semibold text-red mb-1">Erreur</h3>
                            <p className="text-red/80">{error}</p>
                        </div>
                    </div>
                    <div className="flex justify-center mt-6">
                        <button 
                            onClick={onClose}
                            className="inline-flex items-center justify-center rounded-xl bg-red px-6 py-3 font-semibold text-white shadow transition hover:bg-red-hover focus:outline-none focus:ring-2 focus:ring-red/40"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            // Sauvegarder les positions avant de fermer
            if (activeTab === 'graph') {
                saveNodePositions();
            }
            onClose();
        }
    };

    const handleClose = () => {
        // Sauvegarder les positions avant de fermer
        if (activeTab === 'graph') {
            saveNodePositions();
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-8 overflow-hidden" onClick={handleOverlayClick}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1400px] max-h-full overflow-hidden font-['Poppins',Arial,sans-serif] flex flex-col">
                <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b border-grey bg-white rounded-t-2xl">
                    <h2 className="text-3xl text-darkBlue m-0 font-semibold">{graphId ? 'Modifier le Graphe' : 'Créer un Graphe'}</h2>
                    <button type="button" className="bg-none border-none text-3xl text-darkBlue cursor-pointer p-2 leading-none transition-all duration-200 rounded-full w-10 h-10 flex items-center justify-center hover:text-red hover:bg-red/10 hover:scale-110" onClick={handleClose}>&times;</button>
                </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-[300px] bg-gray-50 border-r border-grey p-6 overflow-y-auto flex-shrink-0">
                <div className="mb-8">
                        <h3 className="m-0 mb-4 text-lg text-darkBlue font-semibold border-b-2 border-blue pb-2">Ateliers disponibles</h3>
                        <div className="flex flex-col gap-3 mt-2">
                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer font-medium text-darkBlue">
                                    <input
                                        type="checkbox"
                                        checked={graphData.workshopData.coloring.enabled}
                                        onChange={() => toggleWorkshop('coloring')}
                                        className="w-5 h-5 cursor-pointer"
                                    />
                                    <span className="select-none">Coloration de graphes</span>
                                </label>
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer font-medium text-darkBlue">
                                    <input
                                        type="checkbox"
                                        checked={graphData.workshopData.spanningTree.enabled}
                                        onChange={() => toggleWorkshop('spanningTree')}
                                        className="w-5 h-5 cursor-pointer"
                                    />
                                    <span className="select-none">Arbre couvrant minimal</span>
                                </label>
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center gap-2 cursor-pointer font-medium text-darkBlue">
                                    <input
                                        type="checkbox"
                                        checked={graphData.workshopData.railwayMaze.enabled}
                                        onChange={() => toggleWorkshop('railwayMaze')}
                                        className="w-5 h-5 cursor-pointer"
                                    />
                                    <span className="select-none">Labyrinthe Voyageur</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="m-0 mb-4 text-lg text-darkBlue font-semibold border-b-2 border-blue pb-2">Navigation</h3>
                        <div className="flex flex-col gap-2">
                            <button 
                                type="button"
                                className={`border rounded-lg px-4 py-3 cursor-pointer text-sm font-medium transition-all duration-200 text-left font-inherit ${
                                    activeTab === 'graph' 
                                        ? 'bg-blue text-white border-blue shadow-md' 
                                        : 'bg-white text-darkBlue border-grey hover:bg-blue hover:text-white hover:border-blue'
                                }`}
                                onClick={() => handleTabChange('graph')}
                            >
                                📊 Graphe
                            </button>
                            
                            {graphData.workshopData.coloring.enabled && (
                                <button 
                                    type="button"
                                    className={`border rounded-lg px-4 py-3 cursor-pointer text-sm font-medium transition-all duration-200 text-left font-inherit ${
                                        activeTab === 'coloring' 
                                            ? 'bg-blue text-white border-blue shadow-md' 
                                            : 'bg-white text-darkBlue border-grey hover:bg-blue hover:text-white hover:border-blue'
                                    }`}
                                    onClick={() => handleTabChange('coloring')}
                                >
                                    🎨 Coloration
                                </button>
                            )}
                            
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="flex-1 p-8 overflow-y-auto bg-white">
                    <form onSubmit={handleSubmit}>
                        {/* Onglet Graphe */}
                        {activeTab === 'graph' && (
                            <div className="min-h-[400px]">
                                <div className="mb-6">
                                    <label htmlFor="name" className="block mb-2 text-darkBlue font-medium">Nom du Graphe</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={graphData.name}
                                        onChange={(e) => setGraphData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                        className="w-full px-3 py-3 border-[1.5px] border-grey rounded-lg text-base font-inherit text-darkBlue transition-all duration-200 focus:border-blue focus:outline-none"
                                    />
                                </div>

                                <div className="flex gap-4 mb-4 flex-wrap">
                                    <button type="button" className="px-6 py-3 rounded-lg text-base font-medium cursor-pointer transition-all duration-200 border-none bg-green text-white hover:bg-green-hover" onClick={handleAddNode}>
                                        Ajouter un sommet
                                    </button>
                                    <button type="button" className="px-6 py-3 rounded-lg text-base font-medium cursor-pointer transition-all duration-200 border-none bg-red text-white flex-1 hover:bg-red-hover" onClick={resetGraph}>
                                        Réinitialiser le graphe
                                    </button>
                                    <button type="button" className="px-6 py-3 rounded-lg text-base font-medium cursor-pointer transition-all duration-200 border-none bg-blue text-white flex-1 hover:bg-blue-hover" onClick={rearrangeGraph}>
                                        Réarranger le graphe
                                    </button>
                                </div>

                                <div
                                    ref={containerRef}
                                    className="w-full min-w-0 max-w-full h-[60vh] min-h-[350px] border border-gray-300 rounded-xl bg-gray-50 shadow-lg box-border transition-all duration-300"
                                ></div>

                                <div className="text-center text-darkBlue my-4 p-4 bg-gray-50 rounded-lg">
                                    <p className="m-2 text-sm text-gray-600">Cliquez sur "Ajouter un sommet" pour créer un nouveau sommet</p>
                                    <p className="m-2 text-sm text-gray-600">Cliquez sur un sommet puis un autre pour créer une arête</p>
                                    <p className="m-2 text-sm text-gray-600">Clic droit sur un sommet ou une arête pour le supprimer</p>
                                </div>
                            </div>
                        )}

                        {/* Onglet Configuration - Coloration */}
                        {activeTab === 'coloring' && (
                            <div className="min-h-[400px]">
                                <div className="bg-gray-50 border border-grey rounded-lg p-6 mt-0">
                                    <h4 className="m-0 mb-4 text-darkBlue text-xl font-semibold">Configuration - Coloration</h4>
                                    
                                    <div className="mb-6">
                                        <label htmlFor="coloring-difficulty" className="block mb-2 text-darkBlue font-medium">Difficulté</label>
                                        <select
                                            id="coloring-difficulty"
                                            value={graphData.workshopData.coloring.difficulty}
                                            onChange={(e) => updateWorkshopConfig('coloring', 'difficulty', e.target.value)}
                                            className="w-full px-3 py-3 border-[1.5px] border-grey rounded-lg text-base font-inherit text-darkBlue transition-all duration-200 focus:border-blue focus:outline-none"
                                        >
                                            <option value="Très facile">Très facile</option>
                                            <option value="Facile">Facile</option>
                                            <option value="Moyen">Moyen</option>
                                            <option value="Difficile">Difficile</option>
                                            <option value="Impossible-preuve-facile">Impossible-preuve-facile</option>
                                            <option value="Impossible-preuve-difficile">Impossible-preuve-difficile</option>
                                        </select>
                                    </div>

                                    <div className="mb-6">
                                        <label htmlFor="optimal-count" className="block mb-2 text-darkBlue font-medium">Nombre optimal de couleurs</label>
                                        <input
                                            type="number"
                                            id="optimal-count"
                                            min="0"
                                            value={graphData.workshopData.coloring.optimalCount}
                                            onChange={(e) => updateWorkshopConfig('coloring', 'optimalCount', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-3 border-[1.5px] border-grey rounded-lg text-base font-inherit text-darkBlue transition-all duration-200 focus:border-blue focus:outline-none"
                                        />
                                    </div>

                                    {graphData.workshopData.coloring.optimalCount > 0 && (
                                        <div className="mb-6">
                                            <label className="block mb-2 text-darkBlue font-medium">Compteurs de pastilles par couleur</label>
                                            <div className="mb-4">
                                                <p className="text-sm text-darkBlue m-0 p-2 bg-gray-50 rounded-md border-l-4 border-blue">
                                                    Total: {getTotalTablets()} / {graphData.data.nodes.length} pastilles
                                                    {getTotalTablets() > graphData.data.nodes.length && (
                                                        <span className="text-red font-semibold"> (Dépassement!)</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mt-2">
                                                {getAvailableColors().map((colorHex, index) => {
                                                    const colorName = ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Violet', 'Rose', 'Vert lime', 'Gris foncé', 'Marron', 'Cyan clair', 'Orange vif', 'Vert néon', 'Bleu clair'][index] || `Couleur ${index + 1}`;
                                                    return (
                                                        <div key={colorHex} className="flex flex-col gap-2 p-4 bg-white border border-grey rounded-lg transition-all duration-200 hover:border-blue">
                                                            <div className="w-full h-5 rounded border border-gray-300 mb-1" style={{ backgroundColor: colorHex }}></div>
                                                            <label htmlFor={`tablet-${index}`} className="text-sm font-medium text-darkBlue text-center">{colorName}</label>
                                                            <input
                                                                type="number"
                                                                id={`tablet-${index}`}
                                                                min="0"
                                                                max={graphData.data.nodes.length}
                                                                value={graphData.workshopData.coloring.tabletCounts[colorName] || 0}
                                                                onChange={(e) => updateTabletCount(colorName, e.target.value)}
                                                                className="px-2 py-2 border-[1.5px] border-grey rounded-md text-sm font-inherit text-darkBlue transition-all duration-200 text-center focus:border-blue focus:outline-none invalid:border-red"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}



                        <div className="flex justify-end gap-4 mt-8 px-8 py-6 border-t border-grey bg-gray-50 rounded-b-2xl">
                            <button type="button" className="px-6 py-3 rounded-lg text-base font-medium cursor-pointer transition-all duration-200 bg-white text-darkBlue border-[1.5px] border-darkBlue hover:bg-blue hover:text-white hover:border-blue" onClick={handleClose}>
                                Annuler
                            </button>
                            <button type="submit" className="px-6 py-3 rounded-lg text-base font-medium cursor-pointer transition-all duration-200 border-none bg-gradient-to-r from-green to-blue text-white shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                {graphId ? 'Mettre à jour' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            </div>
        </div>
    );
};

export default GraphEditor; 