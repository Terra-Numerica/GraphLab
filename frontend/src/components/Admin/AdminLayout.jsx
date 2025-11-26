import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const AdminLayout = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = () => {
            const token = sessionStorage.getItem('jwt');
            setIsAuthenticated(!!token);
        };
        checkAuth();
        window.addEventListener('authChanged', checkAuth);
        return () => window.removeEventListener('authChanged', checkAuth);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('jwt');
        setIsAuthenticated(false);
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Admin Navbar - même style que le site principal */}
            <nav className="sticky top-0 z-50 w-full border-b border-darkBlue navbar-gradient text-white">
                <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-3 sm:px-6 md:px-8 md:py-4">
                    {/* Logo à gauche */}
                    <div className="flex items-center gap-2">
                        <a href="/" className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-white">GraphLab par</span>
                            <img src="/logo_tn.png" alt="Terra Numerica Logo" className="h-10 w-auto" />
                        </a>
                        <span className="ml-4 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">Admin</span>
                    </div>

                    {/* Navigation admin au centre */}
                    <div className="hidden md:flex md:items-center md:gap-6">
                        <button
                            onClick={() => navigate('/admin')}
                            className="text-lg font-medium hover:text-lightBlue transition-colors"
                        >
                            🏠 Dashboard
                        </button>
                        <button
                            onClick={() => navigate('/admin/graphs')}
                            className="text-lg font-medium hover:text-lightBlue transition-colors"
                        >
                            📊 Graphes
                        </button>
                        <button
                            onClick={() => navigate('/admin/workshops')}
                            className="text-lg font-medium hover:text-lightBlue transition-colors"
                        >
                            🎯 Ateliers
                        </button>
                    </div>

                    {/* Actions à droite */}
                    <div className="flex items-center gap-3">
                        <a
                            href="/"
                            className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-2.5 text-base font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lightBlue/50 transition-colors"
                        >
                            Retour au site
                        </a>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-2.5 text-base font-medium hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-lightBlue/50 transition-colors"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            </nav>

            {/* Contenu principal */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
