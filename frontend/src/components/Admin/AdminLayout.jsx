import AdminSidebar from './AdminSidebar';
import '../../styles/Admin/AdminLayout.css';

const AdminLayout = ({ children }) => {
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
