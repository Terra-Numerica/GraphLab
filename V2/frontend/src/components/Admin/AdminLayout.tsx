import AdminSidebar from './AdminSidebar';
import '../../styles/Admin/AdminLayout.css';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="admin-layout">
            <AdminSidebar />
            <div className="admin-main">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
