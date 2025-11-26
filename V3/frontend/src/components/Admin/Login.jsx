import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ❌ supprimé : import '../../styles/Admin/Login.css';
import config from '../../config';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${config.apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!response.ok) {
                throw new Error("Identifiant ou mot de passe invalide");
            }
            const data = await response.json();
            sessionStorage.setItem('jwt', data.token);
            window.dispatchEvent(new Event('authChanged'));
            navigate('/admin');
        } catch (err) {
            setError(err.message || 'Erreur lors de la connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen login-gradient flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
            {/* Pattern overlay subtil */}
            <div 
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'><path d='M 20 0 L 0 0 0 20' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='0.5'/></pattern></defs><rect width='100' height='100' fill='url(%23grid)'/></svg>")`
                }}
            />
            
            <div className="relative z-10 w-full max-w-md">
                {/* Header avec logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-2xl font-semibold text-white drop-shadow-lg">GraphLab par</span>
                        <img src="/logo_tn.png" alt="Terra Numerica Logo" className="h-8 w-auto drop-shadow-lg" />
                    </div>
                    <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/30 inline-block">
                        Panel Administrateur
                    </div>
                </div>

                {/* Login Card */}
                <section className="rounded-2xl bg-white/95 backdrop-blur-sm p-8 shadow-2xl border border-white/20">
                    <div className="text-center mb-8">
                        <h1 className="text-darkBlue mb-3 text-3xl font-bold tracking-wide drop-shadow-sm">
                            Connexion
                        </h1>
                        <p className="text-astro leading-relaxed">
                            Accédez au panel d'administration de GraphLab
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="flex items-center gap-4 p-4 bg-red/10 border border-red/20 rounded-xl">
                                <div className="text-2xl">⚠️</div>
                                <div>
                                    <h3 className="text-base font-semibold text-red mb-1">Erreur de connexion</h3>
                                    <p className="text-red/80 text-sm">{error}</p>
                                </div>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <label htmlFor="username" className="block text-sm font-semibold text-darkBlue">
                                Nom d'utilisateur
                            </label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Entrez votre nom d'utilisateur"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base bg-white text-darkBlue outline-none transition-all duration-300 focus:border-blue focus:shadow-[0_0_0_3px_rgba(36,161,235,0.1)] disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-semibold text-darkBlue">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Entrez votre mot de passe"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base bg-white text-darkBlue outline-none transition-all duration-300 focus:border-blue focus:shadow-[0_0_0_3px_rgba(36,161,235,0.1)] disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center rounded-xl bg-blue px-6 py-4 font-semibold text-white shadow transition hover:bg-blue-hover focus:outline-none focus:ring-2 focus:ring-blue/40 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    Connexion en cours...
                                </>
                            ) : (
                                '🔐 Se connecter'
                            )}
                        </button>
                    </form>

                    {/* Lien retour */}
                    <div className="text-center mt-6 pt-6 border-t border-grey">
                        <a 
                            href="/" 
                            className="inline-flex items-center gap-2 text-blue hover:text-blue-hover transition-colors font-medium"
                        >
                            ← Retour au site principal
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Login; 