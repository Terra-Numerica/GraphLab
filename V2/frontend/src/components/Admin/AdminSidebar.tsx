import { useLocation, useNavigate } from 'react-router-dom';
import '../../styles/Admin/AdminSidebar.css';

const AdminSidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '🏠',
            path: '/admin'
        },
        {
            id: 'graphs',
            label: 'Graphes',
            icon: '📊',
            path: '/admin/graphs'
        },
        {
            id: 'workshops',
            label: 'Ateliers',
            icon: '🎯',
            path: '/admin/workshops'
        }
    ];

    const handleLogout = () => {
        sessionStorage.removeItem('jwt');
        navigate('/');
    };

    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <h2>GraphLab Admin</h2>
            </div>
            
            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map(item => (
                        <li key={item.id} className="nav-item">
                            <button
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <span className="logout-icon">🚪</span>
                    <span>Déconnexion</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
