import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Admin/Login.css';
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
        <div className="login-page">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Connexion Admin</h2>
                {error && <div className="login-error">{error}</div>}
                <input
                    type="text"
                    placeholder="Nom d'utilisateur"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                </button>
            </form>
        </div>
    );
};

export default Login; 