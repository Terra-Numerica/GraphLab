import { Navigate, Outlet, useLocation } from "react-router-dom";

export const RequireAuth = () => {
    const location = useLocation();
    const isAuthenticated = !!localStorage.getItem('jwt');

    return !isAuthenticated ? <Navigate to="/admin/login" state={{ from: location }} replace /> : <Outlet />;
}