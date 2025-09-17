import { useState, useEffect } from 'react';
import config from '../../config';
import '../../styles/Admin/Workshops.css';

const Workshops = () => {
    const [workshops, setWorkshops] = useState({
        coloring: {
            name: 'Coloration de Graphes',
            description: 'Atelier d\'apprentissage de la coloration de graphes',
            enabled: false,
            mode: 'development', // development ou production
            lastModified: null
        },
        spanningTree: {
            name: 'Arbre Couvrant Minimal',
            description: 'Atelier sur les algorithmes d\'arbre couvrant minimal',
            enabled: false,
            mode: 'development',
            lastModified: null
        },
        railwayMaze: {
            name: 'Labyrinthe Voyageur',
            description: 'Atelier de résolution de labyrinthes avec contraintes',
            enabled: false,
            mode: 'development',
            lastModified: null
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchWorkshopSettings();
    }, []);

    const fetchWorkshopSettings = async () => {
        try {
            setLoading(true);
            // Pour l'instant, on utilise des données statiques
            // Plus tard, on pourra récupérer depuis l'API
            setWorkshops(prev => ({
                ...prev,
                coloring: { ...prev.coloring, lastModified: new Date().toISOString() },
                spanningTree: { ...prev.spanningTree, lastModified: new Date().toISOString() },
                railwayMaze: { ...prev.railwayMaze, lastModified: new Date().toISOString() }
            }));
        } catch (err) {
            setError('Erreur lors du chargement des paramètres');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkshop = (workshopKey) => {
        setWorkshops(prev => ({
            ...prev,
            [workshopKey]: {
                ...prev[workshopKey],
                enabled: !prev[workshopKey].enabled,
                lastModified: new Date().toISOString()
            }
        }));
    };

    const changeMode = (workshopKey, mode) => {
        setWorkshops(prev => ({
            ...prev,
            [workshopKey]: {
                ...prev[workshopKey],
                mode,
                lastModified: new Date().toISOString()
            }
        }));
    };

    const saveSettings = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            // Ici, on pourrait envoyer les paramètres à l'API
            // const response = await fetch(`${config.apiUrl}/admin/workshops`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(workshops)
            // });

            // if (!response.ok) {
            //     throw new Error('Erreur lors de la sauvegarde');
            // }

            // Simulation d'une sauvegarde réussie
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setSuccess('Paramètres sauvegardés avec succès !');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Erreur lors de la sauvegarde des paramètres');
            console.error('Erreur:', err);
        } finally {
            setLoading(false);
        }
    };

    const getModeIcon = (mode) => {
        return mode === 'production' ? '🚀' : '🔧';
    };

    const getModeLabel = (mode) => {
        return mode === 'production' ? 'Production' : 'Développement';
    };

    const getModeDescription = (mode) => {
        return mode === 'production' 
            ? 'Atelier visible et accessible aux utilisateurs'
            : 'Atelier en mode test, visible uniquement en développement';
    };

    if (loading && !workshops.coloring.lastModified) {
        return (
            <div className="workshops">
                <div className="loading-state">Chargement des paramètres...</div>
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
                    {Object.entries(workshops).map(([key, workshop]) => (
                        <div key={key} className="workshop-card">
                            <div className="workshop-header">
                                <h3>{workshop.name}</h3>
                                <div className="workshop-status">
                                    <span className={`status-badge ${workshop.enabled ? 'enabled' : 'disabled'}`}>
                                        {workshop.enabled ? 'Activé' : 'Désactivé'}
                                    </span>
                                </div>
                            </div>

                            <div className="workshop-description">
                                <p>{workshop.description}</p>
                            </div>

                            <div className="workshop-controls">
                                <div className="control-group">
                                    <label className="control-label">
                                        <input
                                            type="checkbox"
                                            checked={workshop.enabled}
                                            onChange={() => toggleWorkshop(key)}
                                        />
                                        <span>Activer l'atelier</span>
                                    </label>
                                </div>

                                <div className="control-group">
                                    <label className="control-label">Mode de fonctionnement</label>
                                    <div className="mode-selector">
                                        <button
                                            className={`workshop-mode-button ${workshop.mode === 'development' ? 'active' : ''}`}
                                            onClick={() => changeMode(key, 'development')}
                                        >
                                            <span className="workshop-mode-icon">🔧</span>
                                            <span className="workshop-mode-label">
                                                <strong>Développement</strong>
                                                <small>Mode test</small>
                                            </span>
                                        </button>
                                        <button
                                            className={`workshop-mode-button ${workshop.mode === 'production' ? 'active' : ''}`}
                                            onClick={() => changeMode(key, 'production')}
                                        >
                                            <span className="workshop-mode-icon">🚀</span>
                                            <span className="workshop-mode-label">
                                                <strong>Production</strong>
                                                <small>Mode public</small>
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {workshop.lastModified && (
                                    <div className="workshop-meta">
                                        <small>
                                            Dernière modification: {new Date(workshop.lastModified).toLocaleString('fr-FR')}
                                        </small>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="workshops-info">
                    <h3>Informations sur les modes</h3>
                    <div className="info-grid">
                        <div className="info-card">
                            <div className="info-icon">🔧</div>
                            <div className="info-content">
                                <h4>Mode Développement</h4>
                                <p>L'atelier est en mode test. Il peut être utilisé pour des tests et des expérimentations sans affecter l'expérience des utilisateurs finaux.</p>
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-icon">🚀</div>
                            <div className="info-content">
                                <h4>Mode Production</h4>
                                <p>L'atelier est activé et accessible aux utilisateurs. Assurez-vous que tout fonctionne correctement avant de passer en production.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Workshops;
