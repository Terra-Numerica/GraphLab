import { useState, useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import config from '../../config';

import '../../styles/Admin/GraphEditor.css';

const GraphEditor = ({ graphId = null, onClose }) => {
    const [graphData, setGraphData] = useState({
        name: '',
        difficulty: 'facile',
        data: {
            nodes: [],
            edges: []
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);
    const cyRef = useRef(null);
    const selectedNodeRef = useRef(null);

    useEffect(() => {
        if (graphId) {
            fetchGraph();
        }
    }, [graphId]);

    const fetchGraph = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.apiUrl}/graph/${graphId}`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération du graphe');
            }
            const data = await response.json();
            setGraphData(data);
        } catch (err) {
            setError('Impossible de charger le graphe.');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!containerRef.current) return;

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
    }, [graphData.data.nodes, graphData.data.edges]);

    const handleAddNode = () => {
        const newNodeId = `node-${Date.now()}`;
        const newNode = {
            group: 'nodes',
            data: { 
                id: newNodeId,
                label: String(graphData.data.nodes.length + 1),
                color: '#cccccc'
            },
            position: {
                x: Math.random() * 600 + 100,
                y: Math.random() * 300 + 100
            }
        };
        
        setGraphData(prev => ({
            ...prev,
            data: {
                ...prev.data,
                nodes: [...prev.data.nodes, newNode]
            }
        }));
    };

    const resetGraph = () => {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const url = graphId 
                ? `${config.apiUrl}/graph/${graphId}`
                : `${config.apiUrl}/graph`;
            
            const method = graphId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(graphData)
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

    return (
        <div className="graph-editor">
            <div className="editor-header">
                <h2>{graphId ? 'Modifier le Graphe' : 'Créer un Graphe'}</h2>
                <button className="btn-close" onClick={onClose}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
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

                <div className="form-group">
                    <label htmlFor="difficulty">Difficulté</label>
                    <select
                        id="difficulty"
                        value={graphData.difficulty}
                        onChange={(e) => setGraphData(prev => ({ ...prev, difficulty: e.target.value }))}
                    >
                        <option value="facile">Facile</option>
                        <option value="moyen">Moyen</option>
                        <option value="difficile">Difficile</option>
                    </select>
                </div>

                <div className="admin-buttons-row">
                    <button className="admin-btn admin-btn-add" onClick={handleAddNode}>
                        Ajouter un sommet
                    </button>
                    <button className="admin-btn admin-btn-reset" onClick={resetGraph}>
                        Réinitialiser le graphe
                    </button>
                    <button className="admin-btn admin-btn-rearrange" onClick={rearrangeGraph}>
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

                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>
                        Annuler
                    </button>
                    <button type="submit" className="btn-primary">
                        {graphId ? 'Mettre à jour' : 'Créer'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GraphEditor; 