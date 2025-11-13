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
        <div className="min-h-screen bg-gradient-to-br from-darkBlue to-blue flex items-center justify-center p-4 sm:p-8 relative overflow-hidden font-['Poppins',Arial,sans-serif]">
            {/* Pattern overlay */}
            <div 
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><pattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'><path d='M 10 0 L 0 0 0 10' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='0.5'/></pattern></defs><rect width='100' height='100' fill='url(%23grid)'/></svg>")`
                }}
            />

            <div className="relative z-10 w-full max-w-md flex flex-col gap-8">
                {/* Header */}
                <div className="text-center text-white">
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-bold m-0 drop-shadow-2xl tracking-wider text-white">
                            GraphLab
                        </h1>
                        <p className="text-lg mt-2 opacity-95 font-normal text-white">
                            Panel Administrateur
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 sm:p-10 shadow-2xl border border-white/20">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl text-darkBlue m-0 mb-2 font-bold">
                            Connexion
                        </h2>
                        <p className="text-gray-600 m-0 text-sm">
                            Accédez au panel d'administration
                        </p>
                    </div>

                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl p-4 text-center text-sm font-medium shadow-lg border border-white/20">
                                {error}
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="username" className="font-semibold text-darkBlue text-xs uppercase tracking-wider">
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
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl text-base font-inherit bg-white text-darkBlue outline-none transition-all duration-300 focus:border-blue focus:shadow-[0_0_0_3px_rgba(36,161,235,0.1)] focus:-translate-y-0.5 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="password" className="font-semibold text-darkBlue text-xs uppercase tracking-wider">
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
                                className="px-4 py-3 border-2 border-gray-200 rounded-xl text-base font-inherit bg-white text-darkBlue outline-none transition-all duration-300 focus:border-blue focus:shadow-[0_0_0_3px_rgba(36,161,235,0.1)] focus:-translate-y-0.5 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue to-green text-white border-none rounded-xl text-lg font-semibold font-inherit px-8 py-4 cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-lg mt-2 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Connexion en cours...
                                </>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className="text-center text-white text-sm">
                    <p className="m-0 opacity-90 text-white">© {new Date().getFullYear()} GraphLab - Plateforme d'apprentissage des graphes</p>
                </div>
            </div>
        </div>
    );
};

export default Login; 