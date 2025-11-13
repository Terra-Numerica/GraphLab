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
            <div className="p-8 max-w-6xl mx-auto font-['Poppins',Arial,sans-serif]">
                <div className="flex justify-center items-center min-h-[200px] text-xl text-darkBlue">
                    Chargement des graphes...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 max-w-6xl mx-auto font-['Poppins',Arial,sans-serif]">
                <div className="text-white bg-red rounded-lg p-4 my-4 font-medium">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto font-['Poppins',Arial,sans-serif]">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl text-darkBlue m-0 font-bold tracking-wide drop-shadow-sm">
                    Gestion des Graphes
                </h1>
                <div className="flex gap-4 items-center">
                    <button 
                        className="px-6 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 border-none bg-gradient-to-r from-green to-blue text-white shadow-md hover:shadow-lg hover:-translate-y-0.5" 
                        onClick={handleCreate}
                    >
                        Nouveau Graphe
                    </button>
                </div>
            </header>

            <main>
                <section>
                    <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4">
                        <h2 className="text-2xl text-darkBlue m-0 font-semibold">Graphes</h2>
                        <div className="flex gap-4 items-center">
                            <input 
                                type="text" 
                                placeholder="Rechercher un graphe..." 
                                className="px-4 py-2 border-[1.5px] border-grey rounded-lg text-base font-inherit bg-white text-darkBlue transition-all duration-200 min-w-[250px] focus:border-blue focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedGraphs.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-xl text-darkBlue">
                                Aucun graphe trouvé
                            </div>
                        ) : (
                            paginatedGraphs.map(graph => (
                                <div key={graph._id} className="bg-white rounded-2xl p-6 shadow-md border border-grey transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                                    <div className="mb-4">
                                        <h3 className="text-xl text-darkBlue m-0 mb-4 font-semibold">{graph.name}</h3>
                                    </div>
                                    <div className="flex gap-3 flex-wrap">
                                        <button 
                                            className="px-4 py-2 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 bg-white text-darkBlue border-[1.5px] border-darkBlue hover:bg-blue hover:text-white hover:border-blue"
                                            onClick={() => handleEdit(graph._id)}
                                        >
                                            Modifier
                                        </button>
                                        <button 
                                            className="px-4 py-2 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 bg-white text-red border-[1.5px] border-red hover:bg-red hover:text-white hover:border-red"
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
                        <div className="flex justify-center items-center gap-2 mt-8">
                            <button
                                key="prev"
                                className="bg-white border-[1.5px] border-blue text-blue px-4 py-2 rounded-lg cursor-pointer text-base font-inherit font-medium transition-all duration-200 hover:bg-blue hover:text-white hover:border-blue disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                &lt;
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={`page-${i + 1}`}
                                    className={`px-4 py-2 rounded-lg cursor-pointer text-base font-inherit font-medium transition-all duration-200 ${
                                        currentPage === i + 1 
                                            ? 'bg-blue text-white border-[1.5px] border-blue' 
                                            : 'bg-white text-blue border-[1.5px] border-blue hover:bg-blue hover:text-white hover:border-blue'
                                    }`}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                key="next"
                                className="bg-white border-[1.5px] border-blue text-blue px-4 py-2 rounded-lg cursor-pointer text-base font-inherit font-medium transition-all duration-200 hover:bg-blue hover:text-white hover:border-blue disabled:opacity-50 disabled:cursor-not-allowed"
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
