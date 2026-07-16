import { useState, useEffect } from 'react';
import config from '../../config';

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
            <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 md:px-8 py-10">
                <section className="rounded-2xl bg-white p-8 shadow-sm">
                    <div className="flex justify-center items-center min-h-[200px] flex-col gap-4">
                        <div className="w-8 h-8 border-4 border-blue/30 border-t-blue rounded-full animate-spin"></div>
                        <p className="text-xl text-darkBlue font-medium">Chargement de la configuration...</p>
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
                            Configuration des Ateliers
                        </h1>
                        <p className="text-astro leading-relaxed">
                            Gérez la disponibilité des ateliers selon les environnements de déploiement.
                        </p>
                    </div>
                    <button 
                        className="inline-flex items-center justify-center rounded-xl bg-green px-6 py-3 font-semibold text-white shadow transition hover:bg-green-hover focus:outline-none focus:ring-2 focus:ring-green/40 disabled:opacity-60 disabled:cursor-not-allowed" 
                        onClick={saveSettings}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                Sauvegarde...
                            </>
                        ) : (
                            <>💾 Sauvegarder</>
                        )}
                    </button>
                </div>

                {/* Messages d'état */}
                {error && (
                    <div className="flex items-center gap-4 p-6 bg-red/10 border border-red/20 rounded-xl mb-6">
                        <div className="text-3xl">⚠️</div>
                        <div>
                            <h3 className="text-lg font-semibold text-red mb-1">Erreur</h3>
                            <p className="text-red/80">{error}</p>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-4 p-6 bg-green/10 border border-green/20 rounded-xl mb-6">
                        <div className="text-3xl">✅</div>
                        <div>
                            <h3 className="text-lg font-semibold text-green mb-1">Succès</h3>
                            <p className="text-green/80">{success}</p>
                        </div>
                    </div>
                )}
            </section>

            {/* Configuration des ateliers */}
            <section className="rounded-2xl bg-white p-8 shadow-sm mb-10">

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Object.entries(workshopInfo).map(([key, info]) => {
                        const config = workshopConfig[key];
                        const isEnabled = isWorkshopEnabled(key);
                        
                        const workshopIcons = {
                            coloring: '🎨',
                            spanningTree: '🌳',
                            railwayMaze: '🚂'
                        };
                        
                        return (
                            <div key={key} className="group flex flex-col gap-4 rounded-2xl border border-grey bg-gray-50 p-6 shadow-sm transition hover:shadow-md">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">{workshopIcons[key]}</div>
                                        <h3 className="text-lg font-semibold text-darkBlue">{info.name}</h3>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        isEnabled 
                                            ? 'bg-green/10 text-green' 
                                            : 'bg-red/10 text-red'
                                    }`}>
                                        {isEnabled ? 'Activé' : 'Désactivé'}
                                    </span>
                                </div>

                                <p className="text-sm text-astro/80 leading-relaxed">{info.description}</p>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-darkBlue text-sm">Environnements :</h4>
                                    
                                    <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-grey cursor-pointer hover:bg-blue/5 transition">
                                        <input
                                            type="checkbox"
                                            checked={config.development}
                                            onChange={() => toggleEnvironment(key, 'development')}
                                            className="w-4 h-4 text-blue border-2 border-grey rounded focus:ring-2 focus:ring-blue/20"
                                        />
                                        <span className="text-lg">🔧</span>
                                        <div className="flex-1">
                                            <div className="font-medium text-darkBlue">Développement</div>
                                            <div className="text-xs text-astro/60">Visible en mode dev</div>
                                        </div>
                                    </label>

                                    <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-grey cursor-pointer hover:bg-blue/5 transition">
                                        <input
                                            type="checkbox"
                                            checked={config.production}
                                            onChange={() => toggleEnvironment(key, 'production')}
                                            className="w-4 h-4 text-blue border-2 border-grey rounded focus:ring-2 focus:ring-blue/20"
                                        />
                                        <span className="text-lg">🚀</span>
                                        <div className="flex-1">
                                            <div className="font-medium text-darkBlue">Production</div>
                                            <div className="text-xs text-astro/60">Visible en mode prod</div>
                                        </div>
                                    </label>
                                </div>

                                <div className="mt-4 p-3 bg-white rounded-xl border border-grey text-center">
                                    {config.production && config.development ? (
                                        <span className="text-sm font-medium text-green">✅ Disponible partout</span>
                                    ) : config.production ? (
                                        <span className="text-sm font-medium text-blue">🚀 Production uniquement</span>
                                    ) : config.development ? (
                                        <span className="text-sm font-medium text-yellow">🔧 Développement uniquement</span>
                                    ) : (
                                        <span className="text-sm font-medium text-red">❌ Non disponible</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="rounded-2xl bg-white p-8 shadow-sm">

                <h2 className="mb-6 text-2xl font-semibold text-darkBlue">Guide des Environnements</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 rounded-xl border border-grey bg-gray-50 p-4">
                        <div className="text-4xl">🔧</div>
                        <div>
                            <h3 className="text-lg font-semibold text-darkBlue mb-1">Développement</h3>
                            <p className="text-sm text-astro/80 leading-relaxed">
                                Visible uniquement en mode développement (NODE_ENV=development)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border border-grey bg-gray-50 p-4">
                        <div className="text-4xl">🚀</div>
                        <div>
                            <h3 className="text-lg font-semibold text-darkBlue mb-1">Production</h3>
                            <p className="text-sm text-astro/80 leading-relaxed">
                                Visible uniquement en mode production (NODE_ENV=production)
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-xl border border-grey bg-gray-50 p-4">
                        <div className="text-4xl">✅</div>
                        <div>
                            <h3 className="text-lg font-semibold text-darkBlue mb-1">Les deux</h3>
                            <p className="text-sm text-astro/80 leading-relaxed">
                                Visible dans tous les environnements si les deux sont activés
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Workshops;
