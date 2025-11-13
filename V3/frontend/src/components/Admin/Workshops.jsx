import { useState, useEffect } from 'react';
import config from '../../config';
// ❌ supprimé : import '../../styles/Admin/Workshops.css';

const Workshops = () => {
    const [workshopConfig, setWorkshopConfig] = useState({
        coloring: {
            production: false,
            development: false
        },
        spanningTree: {
            production: false,
            development: false
        },
        railwayMaze: {
            production: false,
            development: false
        }
    });
    const [workshopInfo] = useState({
        coloring: {
            name: 'Coloration de Graphes',
            description: "Atelier de coloration de graphes"
        },
        spanningTree: {
            name: 'Arbre Couvrant Minimal',
            description: "Atelier de résolution d'arbre couvrant minimal"
        },
        railwayMaze: {
            name: 'Labyrinthe Voyageur',
            description: "Atelier de résolution de labyrinthes voyageur"
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [workshopId, setWorkshopId] = useState(null);

    useEffect(() => {
        fetchWorkshopSettings();
    }, []);

    const fetchWorkshopSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = sessionStorage.getItem('jwt');
            const response = await fetch(`${config.apiUrl}/workshop`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement de la configuration');
            }

            const workshops = await response.json();
            
            if (workshops.length > 0) {
                // Prendre le premier workshop (configuration globale)
                const config = workshops[0];
                setWorkshopId(config._id);
                setWorkshopConfig({
                    coloring: {
                        production: config.coloring?.production || false,
                        development: config.coloring?.development || false
                    },
                    spanningTree: {
                        production: config.spanningTree?.production || false,
                        development: config.spanningTree?.development || false
                    },
                    railwayMaze: {
                        production: config.railwayMaze?.production || false,
                        development: config.railwayMaze?.development || false
                    }
                });
            }
        } catch (err) {
            setError('Erreur lors du chargement des paramètres');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleEnvironment = (workshopKey, environment) => {
        setWorkshopConfig(prev => ({
            ...prev,
            [workshopKey]: {
                ...prev[workshopKey],
                [environment]: !prev[workshopKey][environment]
            }
        }));
    };

    const saveSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const token = sessionStorage.getItem('jwt');
            
            if (workshopId) {
                // Mettre à jour la configuration existante
                const response = await fetch(`${config.apiUrl}/workshop/${workshopId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(workshopConfig)
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la mise à jour');
                }
            } else {
                // Créer une nouvelle configuration
                const response = await fetch(`${config.apiUrl}/workshop`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(workshopConfig)
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la création');
                }

                const newWorkshop = await response.json();
                setWorkshopId(newWorkshop._id);
            }
            
            setSuccess('Configuration sauvegardée avec succès !');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Erreur lors de la sauvegarde de la configuration');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const getEnvironmentIcon = (environment) => {
        return environment === 'production' ? '🚀' : '🔧';
    };

    const getEnvironmentLabel = (environment) => {
        return environment === 'production' ? 'Production' : 'Développement';
    };

    const getEnvironmentDescription = (environment) => {
        return environment === 'production' 
            ? 'Atelier visible et accessible aux utilisateurs en production'
            : 'Atelier visible et accessible aux utilisateurs en développement';
    };

    const isWorkshopEnabled = (workshopKey) => {
        const workshop = workshopConfig[workshopKey];
        return workshop.production || workshop.development;
    };

    if (loading && !workshopId) {
        return (
            <div className="p-8 max-w-6xl mx-auto font-['Poppins',Arial,sans-serif]">
                <div className="flex justify-center items-center min-h-[200px] text-xl text-darkBlue">
                    Chargement de la configuration...
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto font-['Poppins',Arial,sans-serif]">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl text-darkBlue m-0 font-bold tracking-wide drop-shadow-sm">
                    Gestion des Ateliers
                </h1>
                <div className="flex gap-4 items-center">
                    <button 
                        className="px-6 py-3 rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 border-none bg-gradient-to-r from-green to-blue text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed" 
                        onClick={saveSettings}
                        disabled={loading}
                    >
                        {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </header>

            <main>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6 font-medium">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6 font-medium">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {Object.entries(workshopInfo).map(([key, info]) => {
                        const config = workshopConfig[key];
                        const isEnabled = isWorkshopEnabled(key);
                        
                        return (
                            <div key={key} className="bg-white rounded-2xl p-8 shadow-md border border-grey transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl text-darkBlue m-0 font-semibold">{info.name}</h3>
                                    <div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                                            isEnabled 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {isEnabled ? 'Activé' : 'Désactivé'}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-gray-600 m-0 leading-relaxed">{info.description}</p>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div>
                                        <label className="block font-semibold text-darkBlue mb-2 text-sm">
                                            Environnements disponibles
                                        </label>
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-grey transition-all duration-200 hover:bg-gray-100">
                                                <label className="flex items-center gap-3 cursor-pointer w-full">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.development}
                                                        onChange={() => toggleEnvironment(key, 'development')}
                                                        className="w-5 h-5 cursor-pointer"
                                                    />
                                                    <span className="text-xl w-6 text-center">🔧</span>
                                                    <span className="flex flex-col gap-1">
                                                        <strong className="text-base text-darkBlue font-semibold">Développement</strong>
                                                        <small className="text-sm text-gray-600">Visible en dev</small>
                                                    </span>
                                                </label>
                                            </div>
                                            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-grey transition-all duration-200 hover:bg-gray-100">
                                                <label className="flex items-center gap-3 cursor-pointer w-full">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.production}
                                                        onChange={() => toggleEnvironment(key, 'production')}
                                                        className="w-5 h-5 cursor-pointer"
                                                    />
                                                    <span className="text-xl w-6 text-center">🚀</span>
                                                    <span className="flex flex-col gap-1">
                                                        <strong className="text-base text-darkBlue font-semibold">Production</strong>
                                                        <small className="text-sm text-gray-600">Visible en prod</small>
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-grey">
                                        <div className="text-center">
                                            {config.production && config.development ? (
                                                <span className="font-semibold text-darkBlue text-sm">✅ Disponible partout</span>
                                            ) : config.production ? (
                                                <span className="font-semibold text-darkBlue text-sm">🚀 Production uniquement</span>
                                            ) : config.development ? (
                                                <span className="font-semibold text-darkBlue text-sm">🔧 Développement uniquement</span>
                                            ) : (
                                                <span className="font-semibold text-darkBlue text-sm">❌ Non disponible</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 bg-white rounded-2xl p-8 shadow-md border border-grey">
                    <h3 className="m-0 mb-6 text-2xl text-darkBlue font-semibold text-center">
                        Informations sur les environnements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl border border-grey">
                            <div className="text-3xl flex-shrink-0">🔧</div>
                            <div>
                                <h4 className="m-0 mb-2 text-lg text-darkBlue font-semibold">Environnement Développement</h4>
                                <p className="m-0 text-gray-600 leading-relaxed text-sm">
                                    L'atelier sera visible et accessible uniquement quand l'application est lancée en mode développement (NODE_ENV=development).
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl border border-grey">
                            <div className="text-3xl flex-shrink-0">🚀</div>
                            <div>
                                <h4 className="m-0 mb-2 text-lg text-darkBlue font-semibold">Environnement Production</h4>
                                <p className="m-0 text-gray-600 leading-relaxed text-sm">
                                    L'atelier sera visible et accessible uniquement quand l'application est lancée en mode production (NODE_ENV=production).
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl border border-grey">
                            <div className="text-3xl flex-shrink-0">✅</div>
                            <div>
                                <h4 className="m-0 mb-2 text-lg text-darkBlue font-semibold">Les deux environnements</h4>
                                <p className="m-0 text-gray-600 leading-relaxed text-sm">
                                    Si les deux environnements sont activés, l'atelier sera visible et accessible dans tous les environnements.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Workshops;
