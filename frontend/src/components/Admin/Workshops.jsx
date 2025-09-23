import { useState, useEffect } from 'react';
import config from '../../config';
import '../../styles/Admin/Workshops.css';

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
            <div className="workshops">
                <div className="loading-state">Chargement de la configuration...</div>
            </div>
        );
    }

    return (
        <div className="workshops">
            <header className="workshops-header">
                <h1>Gestion des Ateliers</h1>
                <div className="header-actions">
                    <button 
                        className="btn-primary" 
                        onClick={saveSettings}
                        disabled={loading}
                    >
                        {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </header>

            <main className="workshops-content">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <div className="workshops-grid">
                    {Object.entries(workshopInfo).map(([key, info]) => {
                        const config = workshopConfig[key];
                        const isEnabled = isWorkshopEnabled(key);
                        
                        return (
                            <div key={key} className="workshop-card">
                                <div className="workshop-header">
                                    <h3>{info.name}</h3>
                                    <div className="workshop-status">
                                        <span className={`status-badge ${isEnabled ? 'enabled' : 'disabled'}`}>
                                            {isEnabled ? 'Activé' : 'Désactivé'}
                                        </span>
                                    </div>
                                </div>

                                <div className="workshop-description">
                                    <p>{info.description}</p>
                                </div>

                                <div className="workshop-controls">
                                    <div className="control-group">
                                        <label className="control-label">Environnements disponibles</label>
                                        <div className="environment-selector">
                                            <div className="environment-option">
                                                <label className="environment-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.development}
                                                        onChange={() => toggleEnvironment(key, 'development')}
                                                    />
                                                    <span className="environment-icon">🔧</span>
                                                    <span className="environment-label">
                                                        <strong>Développement</strong>
                                                        <small>Visible en dev</small>
                                                    </span>
                                                </label>
                                            </div>
                                            <div className="environment-option">
                                                <label className="environment-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.production}
                                                        onChange={() => toggleEnvironment(key, 'production')}
                                                    />
                                                    <span className="environment-icon">🚀</span>
                                                    <span className="environment-label">
                                                        <strong>Production</strong>
                                                        <small>Visible en prod</small>
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="workshop-status-info">
                                        <div className="status-summary">
                                            {config.production && config.development ? (
                                                <span className="status-text">✅ Disponible partout</span>
                                            ) : config.production ? (
                                                <span className="status-text">🚀 Production uniquement</span>
                                            ) : config.development ? (
                                                <span className="status-text">🔧 Développement uniquement</span>
                                            ) : (
                                                <span className="status-text">❌ Non disponible</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="workshops-info">
                    <h3>Informations sur les environnements</h3>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-icon">🔧</div>
                            <div className="info-content">
                                <h4>Environnement Développement</h4>
                                <p>L'atelier sera visible et accessible uniquement quand l'application est lancée en mode développement (NODE_ENV=development).</p>
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">🚀</div>
                            <div className="info-content">
                                <h4>Environnement Production</h4>
                                <p>L'atelier sera visible et accessible uniquement quand l'application est lancée en mode production (NODE_ENV=production).</p>
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">✅</div>
                            <div className="info-content">
                                <h4>Les deux environnements</h4>
                                <p>Si les deux environnements sont activés, l'atelier sera visible et accessible dans tous les environnements.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Workshops;
