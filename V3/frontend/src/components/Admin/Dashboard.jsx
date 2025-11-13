// Imports
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ❌ supprimé : import '../../styles/Admin/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <div className="p-0 w-full font-['Poppins',Arial,sans-serif]">
            <main className="p-8 max-w-none w-full">
                <div className="flex justify-center items-center min-h-[93vh]">
                    <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg text-center max-w-4xl w-full border border-gray-200">
                        <h2 className="text-3xl sm:text-4xl text-darkBlue m-0 mb-6 font-bold leading-tight">
                            Bienvenue sur le panel Admin de GraphLab
                        </h2>
                        <p className="text-lg sm:text-xl text-gray-600 m-0 mb-10 leading-relaxed">
                            Vous êtes connecté en tant qu'administrateur. Utilisez la navigation 
                            sur le côté pour accéder aux différentes sections de gestion.
                        </p>
                        
                        <div className="mb-12">
                            <h3 className="text-2xl text-darkBlue m-0 mb-6 font-semibold">Actions rapides</h3>
                            <div className="flex gap-6 justify-center flex-wrap">
                                <button 
                                    className="px-8 py-4 text-lg rounded-xl min-w-[200px] bg-gradient-to-r from-blue to-green text-white border-none font-semibold cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                                    onClick={() => navigate('/admin/graphs')}
                                >
                                    📊 Gérer les Graphes
                                </button>
                                <button 
                                    className="px-8 py-4 text-lg rounded-xl min-w-[200px] bg-white text-blue border-2 border-blue font-semibold cursor-pointer transition-all duration-300 hover:bg-blue hover:text-white"
                                    onClick={() => navigate('/admin/workshops')}
                                >
                                    🎯 Gérer les Ateliers
                                </button>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-8">
                            <h3 className="text-2xl text-darkBlue m-0 mb-6 font-semibold">Informations système</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                                    <div className="text-4xl flex-shrink-0">📈</div>
                                    <div>
                                        <h4 className="m-0 mb-2 text-xl text-darkBlue font-semibold">GraphLab</h4>
                                        <p className="m-0 text-gray-600 text-sm leading-snug">
                                            Plateforme d'apprentissage des graphes
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                                    <div className="text-4xl flex-shrink-0">🔧</div>
                                    <div>
                                        <h4 className="m-0 mb-2 text-xl text-darkBlue font-semibold">Mode Admin</h4>
                                        <p className="m-0 text-gray-600 text-sm leading-snug">
                                            Gestion complète du système
                                        </p>
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