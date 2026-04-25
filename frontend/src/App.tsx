import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import PermissionsPage from './pages/PermissionsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import DocumentsPage from './pages/DocumentsPage';
import CapaPage from './pages/CapaPage';
import NcrPage from './pages/NcrPage';
import AuditsPage from './pages/AuditsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import SmtpSettingsPage from './pages/SmtpSettingsPage';
import StorageSettingsPage from './pages/StorageSettingsPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import MyProfilePage from './pages/MyProfilePage';

const App = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/permissions" element={<PermissionsPage />} />
          <Route path="/departments" element={<DepartmentsPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/capa" element={<CapaPage />} />
          <Route path="/ncr" element={<NcrPage />} />
          <Route path="/audits" element={<AuditsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/profile" element={<MyProfilePage />} />
          <Route path="/settings/smtp" element={<SmtpSettingsPage />} />
          <Route path="/settings/storage" element={<StorageSettingsPage />} />
          <Route path="/settings/company-profile" element={<CompanyProfilePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
