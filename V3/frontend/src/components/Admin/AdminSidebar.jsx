import { useLocation, useNavigate } from 'react-router-dom';
// ❌ supprimé : import '../../styles/Admin/AdminSidebar.css';

const AdminSidebar = () => {
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
        <div className="fixed top-0 left-0 w-[250px] h-screen bg-gradient-to-br from-darkBlue to-blue text-white flex flex-col z-[1000] shadow-lg md:translate-x-0 -translate-x-full transition-transform duration-300">
            <div className="px-6 py-8 border-b border-white/10">
                <h2 className="m-0 text-2xl font-bold text-white text-center">GraphLab Admin</h2>
            </div>
            
            <nav className="flex-1 py-4">
                <ul className="list-none m-0 p-0">
                    {menuItems.map(item => (
                        <li key={item.id} className="m-0">
                            <button
                                className={`flex items-center w-full px-6 py-4 bg-none border-none text-white/80 text-base font-medium font-inherit cursor-pointer transition-all duration-300 text-left hover:bg-white/10 hover:text-white ${
                                    location.pathname === item.path 
                                        ? 'bg-white/20 text-white border-r-[3px] border-green' 
                                        : ''
                                }`}
                                onClick={() => navigate(item.path)}
                            >
                                <span className="text-xl mr-3 w-6 text-center">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="p-6 border-t border-white/10">
                <button 
                    className="flex items-center w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium font-inherit cursor-pointer transition-all duration-300 hover:bg-white/20 hover:border-white/30" 
                    onClick={handleLogout}
                >
                    <span className="text-base mr-2">🚪</span>
                    <span>Déconnexion</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
