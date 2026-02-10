// Imports
import { useState, useEffect } from 'react';
import config from '../../config';
import GraphEditor from './GraphEditor';

// ❌ supprimé : import '../../styles/Admin/GraphList.css';

const GRAPHS_PER_PAGE = 12;

const GraphList = () => {
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
            <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-8 py-10">
                <section className="rounded-2xl bg-white p-8 shadow-sm">
                    <div className="flex justify-center items-center min-h-[200px] flex-col gap-4">
                        <div className="w-8 h-8 border-4 border-blue/30 border-t-blue rounded-full animate-spin"></div>
                        <p className="text-xl text-darkBlue font-medium">Chargement des graphes...</p>
                    </div>
                </section>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-8 py-10">
                <section className="rounded-2xl bg-white p-8 shadow-sm">
                    <div className="flex items-center gap-4 p-6 bg-red/10 border border-red/20 rounded-xl">
                        <div className="text-3xl">⚠️</div>
                        <div>
                            <h3 className="text-lg font-semibold text-red mb-1">Erreur de chargement</h3>
                            <p className="text-red/80">{error}</p>
                        </div>
                    </div>
                </section>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-8 py-10">
            {/* En-tête */}
            <section className="rounded-2xl bg-white p-8 shadow-sm mb-10">
                <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4">
                    <div>
                        <h1 className="text-darkBlue mb-3 text-3xl md:text-4xl font-bold tracking-wide drop-shadow-sm">
                            Gestion des Graphes
                        </h1>
                        <p className="text-astro leading-relaxed">
                            Créez, modifiez et gérez les graphes utilisés dans les différents ateliers.
                        </p>
                    </div>
                    <button 
                        className="inline-flex items-center justify-center rounded-xl bg-blue px-6 py-3 font-semibold text-white shadow transition hover:bg-blue-hover focus:outline-none focus:ring-2 focus:ring-blue/40" 
                        onClick={handleCreate}
                    >
                        ➕ Nouveau Graphe
                    </button>
                </div>

                {/* Barre de recherche */}
                <div className="flex justify-between items-center flex-col sm:flex-row gap-4">
                    <h2 className="text-2xl font-semibold text-darkBlue">Liste des Graphes</h2>
                    <input 
                        type="text" 
                        placeholder="Rechercher un graphe..." 
                        className="px-4 py-3 border-2 border-gray-200 rounded-xl text-base bg-white text-darkBlue outline-none transition-all duration-300 min-w-[250px] focus:border-blue focus:shadow-[0_0_0_3px_rgba(36,161,235,0.1)]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </section>

            {/* Liste des graphes */}
            <section className="rounded-2xl bg-white p-8 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedGraphs.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <div className="text-6xl mb-4">📊</div>
                            <h3 className="text-xl font-semibold text-darkBlue mb-2">Aucun graphe trouvé</h3>
                            <p className="text-astro/80">
                                {searchQuery ? 'Aucun graphe ne correspond à votre recherche.' : 'Commencez par créer votre premier graphe.'}
                            </p>
                        </div>
                    ) : (
                        paginatedGraphs.map(graph => (
                            <div key={graph._id} className="group flex flex-col items-start gap-3 rounded-2xl border border-grey bg-gray-50 p-6 shadow-sm transition hover:shadow-md">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="text-2xl">📊</div>
                                    <h3 className="text-lg font-semibold text-darkBlue">{graph.name}</h3>
                                </div>
                                
                                {/* Informations sur le graphe */}
                                <div className="text-sm text-astro/80 mb-4">
                                    <p>Nœuds: {graph.data?.nodes?.length || 0}</p>
                                    <p>Arêtes: {graph.data?.edges?.length || 0}</p>
                                    <p>Créé: {new Date(graph.createdAt).toLocaleDateString('fr-FR')}</p>
                                </div>

                                {/* Ateliers activés */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {graph.workshopData?.coloring?.enabled && (
                                        <span className="px-2 py-1 bg-blue/10 text-blue text-xs rounded-full font-medium">
                                            🎨 Coloration
                                        </span>
                                    )}
                                    {graph.workshopData?.spanningTree?.enabled && (
                                        <span className="px-2 py-1 bg-green/10 text-green text-xs rounded-full font-medium">
                                            🌳 Arbre Couvrant
                                        </span>
                                    )}
                                    {graph.workshopData?.railwayMaze?.enabled && (
                                        <span className="px-2 py-1 bg-yellow/10 text-darkBlue text-xs rounded-full font-medium">
                                            🚂 Labyrinthe Voyageur
                                        </span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 w-full">
                                    <button 
                                        className="flex-1 inline-flex items-center justify-center rounded-xl bg-blue px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-hover focus:outline-none focus:ring-2 focus:ring-blue/40"
                                        onClick={() => handleEdit(graph._id)}
                                    >
                                        ✏️ Modifier
                                    </button>
                                    <button 
                                        className="inline-flex items-center justify-center rounded-xl bg-red px-4 py-2 font-semibold text-white shadow transition hover:bg-red-hover focus:outline-none focus:ring-2 focus:ring-red/40"
                                        onClick={() => handleDelete(graph._id)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8 pt-6 border-t border-grey">
                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-blue text-blue px-4 py-2 font-semibold transition hover:bg-blue hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ← Précédent
                        </button>
                        
                        <div className="flex gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={`page-${i + 1}`}
                                    className={`px-4 py-2 rounded-xl font-semibold transition ${
                                        currentPage === i + 1 
                                            ? 'bg-blue text-white shadow' 
                                            : 'bg-white text-blue border-2 border-blue hover:bg-blue hover:text-white'
                                    }`}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        
                        <button
                            className="inline-flex items-center justify-center rounded-xl border-2 border-blue text-blue px-4 py-2 font-semibold transition hover:bg-blue hover:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Suivant →
                        </button>
                    </div>
                )}
            </section>

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
