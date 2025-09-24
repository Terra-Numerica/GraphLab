// Imports
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Styles
import '../../styles/Admin/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard">
            <main className="dashboard-content">
                <div className="welcome-section">
                    <div className="welcome-card">
                        <h2>Bienvenue sur le panel Admin de GraphLab</h2>
                        <p>
                            Vous êtes connecté en tant qu'administrateur. Utilisez la navigation 
                            sur le côté pour accéder aux différentes sections de gestion.
                        </p>
                        
                        <div className="quick-actions">
                            <h3>Actions rapides</h3>
                            <div className="action-buttons">
                                <button 
                                    className="admin-btn-primary"
                                    onClick={() => navigate('/admin/graphs')}
                                >
                                    📊 Gérer les Graphes
                                </button>
                                <button 
                                    className="admin-btn-secondary"
                                    onClick={() => navigate('/admin/workshops')}
                                >
                                    🎯 Gérer les Ateliers
                                </button>
                            </div>
                        </div>

                        <div className="admin-stats">
                            <h3>Informations système</h3>
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-icon">📈</div>
                                    <div className="stat-content">
                                        <h4>GraphLab</h4>
                                        <p>Plateforme d'apprentissage des graphes</p>
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-icon">🔧</div>
                                    <div className="stat-content">
                                        <h4>Mode Admin</h4>
                                        <p>Gestion complète du système</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard; 