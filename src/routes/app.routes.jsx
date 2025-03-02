import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/layout/login";
import Dashboard from "../pages/layout/dashboard";
import Roles from "../pages/layout/settings/roles";
import Users from "../pages/layout/settings/users";
import JobPositions from "../pages/layout/settings/job-positions";
import Accounts from "../pages/layout/transactions/accounts";
import GeneralLedger from "../pages/layout/transactions/general-ledgers";
import Reports from "../pages/layout/transactions/reports";
import ProtectedRoute from "../states/protected-route";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rute publik (tidak memerlukan login) */}
      <Route path="/login" element={<Login />} />

      {/* Rute yang dilindungi */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/users" element={<Users />} />
        <Route path="/job-positions" element={<JobPositions />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/general-ledgers" element={<GeneralLedger />} />
        <Route path="/reports" element={<Reports />} />

        {/* Tambahkan rute lain yang dilindungi di sini */}
      </Route>

      {/* Redirect ke dashboard untuk rute root */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Redirect ke login untuk rute yang tidak ditemukan */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
