import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./use-auth";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  // Jika user tidak ada, arahkan ke halaman login dengan replace
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika user ada, tampilkan rute yang dilindungi
  return <Outlet />;
};

export default ProtectedRoute;
