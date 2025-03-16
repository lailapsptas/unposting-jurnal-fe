import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/layout/login";
import Dashboard from "../pages/layout/dashboard";
import Roles from "../pages/layout/settings/roles";
import Users from "../pages/layout/settings/users";
import JobPositions from "../pages/layout/settings/job-positions";
import Accounts from "../pages/layout/transactions/accounts";
import GeneralLedger from "../pages/layout/transactions/general-ledgers";
import PettyCash from "../pages/layout/transactions/petty-cash";
import JournalPost from "../pages/layout/transactions/postings";
import Reports from "../pages/layout/transactions/reports";
import ProtectedRoute from "../states/protected-route";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roles" element={<Roles />} />
        <Route path="/users" element={<Users />} />
        <Route path="/job-positions" element={<JobPositions />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/general-ledgers" element={<GeneralLedger />} />
        <Route path="/petty-cash" element={<PettyCash />} />
        <Route path="/postings" element={<JournalPost />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
