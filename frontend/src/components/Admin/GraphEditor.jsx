import { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import config from '../../config';
import { colors } from '../../utils/colorPalette';

import '../../styles/Admin/GraphEditor.css';

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
        return <div className="editor-loading">Chargement...</div>;
    }

    if (error) {
        return <div className="editor-error">{error}</div>;
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
        <div className="graph-editor-overlay" onClick={handleOverlayClick}>
            <div className="graph-editor">
                <div className="editor-header">
                    <h2>{graphId ? 'Modifier le Graphe' : 'Créer un Graphe'}</h2>
                    <button type="button" className="btn-close" onClick={handleClose}>&times;</button>
                </div>

            <div className="editor-layout">
                {/* Sidebar */}
                <div className="editor-sidebar">
                <div className="sidebar-section">
                        <h3>Ateliers disponibles</h3>
                        <div className="workshop-selection">
                            <div className="workshop-item">
                                <label className="workshop-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={graphData.workshopData.coloring.enabled}
                                        onChange={() => toggleWorkshop('coloring')}
                                    />
                                    <span>Coloration de graphes</span>
                                </label>
                            </div>
                            <div className="workshop-item">
                                <label className="workshop-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={graphData.workshopData.spanningTree.enabled}
                                        onChange={() => toggleWorkshop('spanningTree')}
                                    />
                                    <span>Arbre couvrant minimal</span>
                                </label>
                            </div>
                            <div className="workshop-item">
                                <label className="workshop-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={graphData.workshopData.railwayMaze.enabled}
                                        onChange={() => toggleWorkshop('railwayMaze')}
                                    />
                                    <span>Railway Maze</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h3>Navigation</h3>
                        <div className="sidebar-nav">
                            <button 
                                type="button"
                                className={`sidebar-nav-item ${activeTab === 'graph' ? 'active' : ''}`}
                                onClick={() => handleTabChange('graph')}
                            >
                                📊 Graphe
                            </button>
                            
                            {graphData.workshopData.coloring.enabled && (
                                <button 
                                    type="button"
                                    className={`sidebar-nav-item ${activeTab === 'coloring' ? 'active' : ''}`}
                                    onClick={() => handleTabChange('coloring')}
                                >
                                    🎨 Coloration
                                </button>
                            )}
                            
                        </div>
                    </div>
                </div>

                {/* Contenu principal */}
                <div className="editor-content">
                    <form onSubmit={handleSubmit}>
                        {/* Onglet Graphe */}
                        {activeTab === 'graph' && (
                            <div className="tab-content">
                                <div className="form-group">
                                    <label htmlFor="name">Nom du Graphe</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={graphData.name}
                                        onChange={(e) => setGraphData(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="admin-buttons-row">
                                    <button type="button" className="admin-btn admin-btn-add" onClick={handleAddNode}>
                                        Ajouter un sommet
                                    </button>
                                    <button type="button" className="admin-btn admin-btn-reset" onClick={resetGraph}>
                                        Réinitialiser le graphe
                                    </button>
                                    <button type="button" className="admin-btn admin-btn-rearrange" onClick={rearrangeGraph}>
                                        Réarranger le graphe
                                    </button>
                                </div>

                                <div
                                    ref={containerRef}
                                    className="cytoscape-container"
                                ></div>

                                <div className="editor-instructions">
                                    <p>Cliquez sur "Ajouter un sommet" pour créer un nouveau sommet</p>
                                    <p>Cliquez sur un sommet puis un autre pour créer une arête</p>
                                    <p>Clic droit sur un sommet ou une arête pour le supprimer</p>
                                </div>
                            </div>
                        )}

                        {/* Onglet Configuration - Coloration */}
                        {activeTab === 'coloring' && (
                            <div className="tab-content">
                                <div className="workshop-config">
                                    <h4>Configuration - Coloration</h4>
                                    
                                    <div className="form-group">
                                        <label htmlFor="coloring-difficulty">Difficulté</label>
                                        <select
                                            id="coloring-difficulty"
                                            value={graphData.workshopData.coloring.difficulty}
                                            onChange={(e) => updateWorkshopConfig('coloring', 'difficulty', e.target.value)}
                                        >
                                            <option value="Très facile">Très facile</option>
                                            <option value="Facile">Facile</option>
                                            <option value="Moyen">Moyen</option>
                                            <option value="Difficile">Difficile</option>
                                            <option value="Impossible-preuve-facile">Impossible-preuve-facile</option>
                                            <option value="Impossible-preuve-difficile">Impossible-preuve-difficile</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="optimal-count">Nombre optimal de couleurs</label>
                                        <input
                                            type="number"
                                            id="optimal-count"
                                            min="0"
                                            value={graphData.workshopData.coloring.optimalCount}
                                            onChange={(e) => updateWorkshopConfig('coloring', 'optimalCount', parseInt(e.target.value) || 0)}
                                        />
                                    </div>

                                    {graphData.workshopData.coloring.optimalCount > 0 && (
                                        <div className="form-group">
                                            <label>Compteurs de pastilles par couleur</label>
                                            <div className="tablet-counts-info">
                                                <p className="tablet-counts-summary">
                                                    Total: {getTotalTablets()} / {graphData.data.nodes.length} pastilles
                                                    {getTotalTablets() > graphData.data.nodes.length && (
                                                        <span className="error-text"> (Dépassement!)</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div className="tablet-counts">
                                                {getAvailableColors().map((colorHex, index) => {
                                                    const colorName = ['Rouge', 'Bleu', 'Vert', 'Jaune', 'Orange', 'Violet', 'Rose', 'Vert lime', 'Gris foncé', 'Marron', 'Cyan clair', 'Orange vif', 'Vert néon', 'Bleu clair'][index] || `Couleur ${index + 1}`;
                                                    return (
                                                        <div key={colorHex} className="tablet-count-item">
                                                            <div className="color-preview" style={{ backgroundColor: colorHex }}></div>
                                                            <label htmlFor={`tablet-${index}`}>{colorName}</label>
                                                            <input
                                                                type="number"
                                                                id={`tablet-${index}`}
                                                                min="0"
                                                                max={graphData.data.nodes.length}
                                                                value={graphData.workshopData.coloring.tabletCounts[colorName] || 0}
                                                                onChange={(e) => updateTabletCount(colorName, e.target.value)}
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



                        <div className="form-actions">
                            <button type="button" className="btn-secondary" onClick={handleClose}>
                                Annuler
                            </button>
                            <button type="submit" className="btn-primary">
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