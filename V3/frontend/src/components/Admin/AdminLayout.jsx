import AdminSidebar from './AdminSidebar';
// ❌ supprimé : import '../../styles/Admin/AdminLayout.css';

const AdminLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen font-['Poppins',Arial,sans-serif]">
            <AdminSidebar />
            <div className="flex-1 ml-0 md:ml-[250px] bg-gray-50 min-h-screen overflow-y-auto">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
