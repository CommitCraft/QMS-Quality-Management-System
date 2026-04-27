import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { AuthLayout } from './layouts/AuthLayout';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/dashboard';
import UsersPage from './pages/access-control/users';
import RolesPage from './pages/access-control/roles';
import RoleUsersPage from './pages/access-control/role-users';
import PermissionsPage from './pages/PermissionsPage';
import DepartmentsPage from './pages/DepartmentsPage';
import DocumentsPage from './pages/documents';
import CapaPage from './pages/CapaPage';
import NcrPage from './pages/NcrPage';
import AuditsPage from './pages/AuditsPage';
import ReportsPage from './pages/reports';
import SettingsPage from './pages/settings';
import SmtpSettingsPage from './pages/SmtpSettingsPage';
import StorageSettingsPage from './pages/StorageSettingsPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import MyProfilePage from './pages/MyProfilePage';
import LoginAuditsPage from './pages/LoginAuditsPage';
import ErrorLogsPage from './pages/ErrorLogsPage';
import CoursePage from './pages/course/CoursePage';
import MyCoursesPage from './pages/course/MyCoursesPage';
import AssignCoursePage from './pages/course/AssignCoursePage';
import CourseSummaryPage from './pages/course/CourseSummaryPage';

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

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_DASHBOARD"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_USERS"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_ROLES"]} />}>
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/roles/manage" element={<RolesPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_ROLE_USER"]} />}>
            <Route path="/roles/users" element={<RoleUsersPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_PERMISSIONS"]} />}>
            <Route path="/permissions" element={<PermissionsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_DEPARTMENTS"]} />}>
            <Route path="/departments" element={<DepartmentsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_MY_DOCUMENTS"]} />}>
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/assign/list-view" element={<DocumentsPage />} />
            <Route path="/assign/folder-view" element={<DocumentsPage />} />
            <Route path="/documents/list-view" element={<DocumentsPage />} />
            <Route path="/documents/folder-view" element={<DocumentsPage />} />
            <Route path="/categories" element={<DocumentsPage />} />
            <Route path="/documents/deep-search" element={<DocumentsPage />} />
            <Route path="/ai-document-generator" element={<DocumentsPage />} />
            <Route path="/ai-document-generator-list" element={<DocumentsPage />} />
            <Route path="/aiprompttemplate" element={<DocumentsPage />} />
            <Route path="/documents/ocr_content_extractor" element={<DocumentsPage />} />
            <Route path="/bulk-document-upload" element={<DocumentsPage />} />
            <Route path="/file-request" element={<DocumentsPage />} />
            <Route path="/document-audit-trails" element={<DocumentsPage />} />
            <Route path="/recent-activity" element={<DocumentsPage />} />
            <Route path="/archive-documents" element={<DocumentsPage />} />
            <Route path="/archive-folders" element={<DocumentsPage />} />
            <Route path="/archive-retention-period" element={<DocumentsPage />} />
            <Route path="/document-status" element={<DocumentsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_CAPA_REQUEST"]} />}>
            <Route path="/capa" element={<CapaPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_NCR_LIST"]} />}>
            <Route path="/ncr" element={<NcrPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_AUDIT_LIST"]} />}>
            <Route path="/audits" element={<AuditsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_REPORTS"]} />}>
            <Route path="/reports" element={<ReportsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_LOGIN_AUDITS"]} />}>
            <Route path="/login-audit" element={<LoginAuditsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_ERROR_LOGS"]} />}>
            <Route path="/logs" element={<ErrorLogsPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_TRAINING_COURSE"]} />}>
            <Route path="/course/list" element={<CoursePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_MY_COURSES"]} />}>
            <Route path="/course/my-courses" element={<MyCoursesPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["MANAGE_TRAINING_ASSIGN_COURSE"]} />}>
            <Route path="/course/assign" element={<AssignCoursePage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_COURSE_SUMMARY"]} />}>
            <Route path="/course/summary" element={<CourseSummaryPage />} />
          </Route>

          <Route element={<ProtectedRoute requiredPermissions={["VIEW_GENERAL_SETTINGS"]} />}>
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<MyProfilePage />} />
            <Route path="/settings/smtp" element={<SmtpSettingsPage />} />
            <Route path="/settings/storage" element={<StorageSettingsPage />} />
            <Route path="/settings/company-profile" element={<CompanyProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
