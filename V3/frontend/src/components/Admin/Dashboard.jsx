// Imports
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ❌ supprimé : import '../../styles/Admin/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="mx-auto w-full max-w-screen-lg px-4 sm:px-6 md:px-8">
                {/* Section principale */}
                <section className="rounded-2xl bg-white p-8 shadow-sm text-center">
                    <h1 className="text-darkBlue mb-6 text-3xl md:text-4xl font-bold tracking-wide drop-shadow-sm">
                        Panel d'Administration
                    </h1>
                    <p className="text-astro leading-relaxed mb-8">
                        Bienvenue sur le panel d'administration de GraphLab. Vous pouvez gérer les graphes, 
                        configurer les ateliers et superviser la plateforme depuis cette interface.
                    </p>

                    {/* Actions rapides */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
                        <div 
                            className="group flex flex-col items-start gap-3 rounded-2xl border border-grey bg-white p-6 shadow-sm transition hover:shadow-md cursor-pointer"
                            onClick={() => navigate('/admin/graphs')}
                        >
                            <div className="text-3xl">📊</div>
                            <div className="text-lg font-semibold text-darkBlue">
                                Gestion des Graphes
                            </div>
                            <div className="text-sm text-astro/80">
                                Créer, modifier et supprimer les graphes utilisés dans les ateliers.
                            </div>
                            <button className="mt-1 inline-flex items-center justify-center rounded-xl bg-blue px-4 py-2 font-semibold text-white shadow transition hover:bg-blue-hover focus:outline-none focus:ring-2 focus:ring-blue/40">
                                Gérer
                            </button>
                        </div>

                        <div 
                            className="group flex flex-col items-start gap-3 rounded-2xl border border-grey bg-white p-6 shadow-sm transition hover:shadow-md cursor-pointer"
                            onClick={() => navigate('/admin/workshops')}
                        >
                            <div className="text-3xl">🎯</div>
                            <div className="text-lg font-semibold text-darkBlue">
                                Configuration des Ateliers
                            </div>
                            <div className="text-sm text-astro/80">
                                Activer/désactiver les ateliers selon l'environnement de déploiement.
                            </div>
                            <button className="mt-1 inline-flex items-center justify-center rounded-xl bg-green px-4 py-2 font-semibold text-white shadow transition hover:bg-green-hover focus:outline-none focus:ring-2 focus:ring-green/40">
                                Configurer
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard; 