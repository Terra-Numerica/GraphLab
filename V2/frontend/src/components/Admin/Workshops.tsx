import { useState, useEffect } from 'react';
import config from '../../config';
import { WorkshopConfig, WorkshopType } from '../../types';
import '../../styles/Admin/Workshops.css';

const Workshops: React.FC = () => {
    const [workshopConfig, setWorkshopConfig] = useState<WorkshopConfig>({
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
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [workshopId, setWorkshopId] = useState<string | null>(null);

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

    const toggleEnvironment = (workshopKey: WorkshopType, environment: 'production' | 'development'): void => {
        setWorkshopConfig((prev: WorkshopConfig) => ({
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


    const isWorkshopEnabled = (workshopKey: WorkshopType): boolean => {
        const workshop = workshopConfig[workshopKey];
        return workshop.production || workshop.development;
    };

    if (loading && !workshopId) {
        return (
            <div className="workshops">
                <div className="admin-loading-state">Chargement de la configuration...</div>
            </div>
        );
    }

    return (
        <div className="workshops">
            <header className="workshops-header">
                <h1>Gestion des Ateliers</h1>
                <div className="admin-header-actions">
                    <button 
                        className="admin-btn admin-btn-primary" 
                        onClick={saveSettings}
                        disabled={loading}
                    >
                        {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                </div>
            </header>

            <main className="workshops-content">
                {error && (
                    <div className="admin-error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="admin-success-message">
                        {success}
                    </div>
                )}

                <div className="admin-workshops-grid">
                    {Object.entries(workshopInfo).map(([key, info]) => {
                        const config = workshopConfig[key as WorkshopType];
                        const isEnabled = isWorkshopEnabled(key as WorkshopType);
                        
                        return (
                            <div key={key} className="admin-workshop-card">
                                <div className="admin-workshop-header">
                                    <h3>{info.name}</h3>
                                    <div className="admin-workshop-status">
                                        <span className={`admin-status-badge ${isEnabled ? 'enabled' : 'disabled'}`}>
                                            {isEnabled ? 'Activé' : 'Désactivé'}
                                        </span>
                                    </div>
                                </div>

                                <div className="admin-workshop-description">
                                    <p>{info.description}</p>
                                </div>

                                <div className="admin-workshop-controls">
                                    <div className="admin-control-group">
                                        <label className="admin-control-label">Environnements disponibles</label>
                                        <div className="admin-environment-selector">
                                            <div className="admin-environment-option">
                                                <label className="admin-environment-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.development}
                                                        onChange={() => toggleEnvironment(key as WorkshopType, 'development')}
                                                    />
                                                    <span className="admin-environment-icon">🔧</span>
                                                    <span className="admin-environment-label">
                                                        <strong>Développement</strong>
                                                        <small>Visible en dev</small>
                                                    </span>
                                                </label>
                                            </div>
                                            <div className="admin-environment-option">
                                                <label className="admin-environment-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.production}
                                                        onChange={() => toggleEnvironment(key as WorkshopType, 'production')}
                                                    />
                                                    <span className="admin-environment-icon">🚀</span>
                                                    <span className="admin-environment-label">
                                                        <strong>Production</strong>
                                                        <small>Visible en prod</small>
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="admin-workshop-status-info">
                                        <div className="admin-status-summary">
                                            {config.production && config.development ? (
                                                <span className="admin-status-text">✅ Disponible partout</span>
                                            ) : config.production ? (
                                                <span className="admin-status-text">🚀 Production uniquement</span>
                                            ) : config.development ? (
                                                <span className="admin-status-text">🔧 Développement uniquement</span>
                                            ) : (
                                                <span className="admin-status-text">❌ Non disponible</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="admin-workshops-info">
                    <h3>Informations sur les environnements</h3>
                    <div className="admin-info-grid">
                        <div className="admin-info-card">
                            <div className="admin-info-icon">🔧</div>
                            <div className="admin-info-content">
                                <h4>Environnement Développement</h4>
                                <p>L'atelier sera visible et accessible uniquement quand l'application est lancée en mode développement (NODE_ENV=development).</p>
                            </div>
                        </div>
                        <div className="admin-info-card">
                            <div className="admin-info-icon">🚀</div>
                            <div className="admin-info-content">
                                <h4>Environnement Production</h4>
                                <p>L'atelier sera visible et accessible uniquement quand l'application est lancée en mode production (NODE_ENV=production).</p>
                            </div>
                        </div>
                        <div className="admin-info-card">
                            <div className="admin-info-icon">✅</div>
                            <div className="admin-info-content">
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
