// Imports
import { useState, useEffect } from 'react';
import config from '../../config';
import GraphEditor from './GraphEditor';
import { Graph } from '../../types';

// Styles
import '../../styles/Admin/GraphList.css';

const GRAPHS_PER_PAGE = 12;

const GraphList: React.FC = () => {
    const [graphs, setGraphs] = useState<Graph[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showEditor, setShowEditor] = useState<boolean>(false);
    const [editingGraphId, setEditingGraphId] = useState<string | null>(null);

    useEffect(() => {
        fetchGraphs();
    }, []);

    const fetchGraphs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${config.apiUrl}/graph`);
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des graphes');
            }
            const data = await response.json();
            setGraphs(data);
            setError(null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Impossible de charger les graphes.';
            setError(errorMessage);
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (graphId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce graphe ?')) {
            try {
                const response = await fetch(
                    `${config.apiUrl}/graph/${graphId}`,
                    { method: 'DELETE' }
                );
                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression');
                }
                fetchGraphs();
            } catch (err) {
                setError('Erreur lors de la suppression du graphe');
                console.error('Erreur:', err);
            }
        }
    };

    const handleEdit = (graphId: string): void => {
        setEditingGraphId(graphId);
        setShowEditor(true);
    };

    const handleCreate = () => {
        setEditingGraphId(null);
        setShowEditor(true);
    };

    const handleCloseEditor = () => {
        setShowEditor(false);
        setEditingGraphId(null);
        fetchGraphs();
    };

    const filteredGraphs = graphs.filter(graph => 
        graph.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredGraphs.length / GRAPHS_PER_PAGE) || 1;
    const paginatedGraphs = filteredGraphs.slice(
        (currentPage - 1) * GRAPHS_PER_PAGE,
        currentPage * GRAPHS_PER_PAGE
    );

    const handlePageChange = (page: number): void => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (loading) {
        return (
            <div className="graph-list">
                <div className="admin-loading-state">Chargement des graphes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="graph-list">
                <div className="admin-error-state">{error}</div>
            </div>
        );
    }

    return (
        <div className="graph-list">
            <header className="list-header">
                <h1>Gestion des Graphes</h1>
                <div className="admin-header-actions">
                    <button className="admin-btn admin-btn-primary" onClick={handleCreate}>
                        Nouveau Graphe
                    </button>
                </div>
            </header>

            <main className="list-content">
                <section className="graphs-section">
                    <div className="admin-section-header">
                        <h2>Graphes</h2>
                        <div className="admin-filters">
                            <input 
                                type="text" 
                                placeholder="Rechercher un graphe..." 
                                className="admin-search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="graphs-grid">
                        {paginatedGraphs.length === 0 ? (
                            <div className="admin-no-data">Aucun graphe trouvé</div>
                        ) : (
                            paginatedGraphs.map(graph => (
                                <div key={graph._id} className="admin-graph-card">
                                    <div className="admin-graph-info">
                                        <h3>{graph.name}</h3>
                                    </div>
                                    <div className="admin-graph-actions">
                                        <button 
                                            className="admin-btn admin-btn-secondary"
                                            onClick={() => handleEdit(graph._id)}
                                        >
                                            Modifier
                                        </button>
                                        <button 
                                            className="admin-btn admin-btn-danger"
                                            onClick={() => handleDelete(graph._id)}
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {totalPages > 1 && (
                        <div className="admin-pagination">
                            <button
                                key="prev"
                                className="admin-pagination-btn admin-pagination-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={`page-${i + 1}`}
                                    className={`admin-pagination-btn admin-pagination-btn${currentPage === i + 1 ? ' active' : ''}`}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                key="next"
                                className="admin-pagination-btn admin-pagination-btn"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </section>
            </main>

            {showEditor && (
                <GraphEditor
                    graphId={editingGraphId}
                    onClose={handleCloseEditor}
                />
            )}
        </div>
    );
};

export default GraphList;
