// Imports
import { useState, useEffect } from 'react';
import config from '../../config';
import GraphEditor from './GraphEditor';

// Styles
import '../../styles/Admin/Dashboard.css';

const GRAPHS_PER_PAGE = 12;

const Dashboard = () => {
    const [graphs, setGraphs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showEditor, setShowEditor] = useState(false);
    const [editingGraphId, setEditingGraphId] = useState(null);

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
            setError('Impossible de charger les graphes.');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (graphId) => {
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

    const handleEdit = (graphId) => {
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

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading-state">Chargement des graphes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="error-state">{error}</div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <header className="dashboard-header">
                <h1>Dashboard Administrateur</h1>
                <div className="header-actions">
                    <button className="btn-primary" onClick={handleCreate}>
                        Nouveau Graphe
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <section className="graphs-section">
                    <div className="section-header">
                        <h2>Graphes</h2>
                        <div className="filters">
                            <input 
                                type="text" 
                                placeholder="Rechercher un graphe..." 
                                className="search-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="graphs-grid">
                        {paginatedGraphs.length === 0 ? (
                            <div className="no-graphs">Aucun graphe trouvé</div>
                        ) : (
                            paginatedGraphs.map(graph => (
                                <div key={graph._id} className="graph-card">
                                    <div className="graph-info">
                                        <h3>{graph.name}</h3>
                                    </div>
                                    <div className="graph-actions">
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => handleEdit(graph._id)}
                                        >
                                            Modifier
                                        </button>
                                        <button 
                                            className="btn-danger"
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
                        <div className="pagination">
                            <button
                                key="prev"
                                className="pagination-btn"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={`page-${i + 1}`}
                                    className={`pagination-btn${currentPage === i + 1 ? ' active' : ''}`}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                key="next"
                                className="pagination-btn"
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

export default Dashboard; 