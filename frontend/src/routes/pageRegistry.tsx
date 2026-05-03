import { lazy } from 'react';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ChangePasswordPage = lazy(() => import('../pages/ChangePasswordPage'));
const DashboardPage = lazy(() => import('../pages/dashboard'));
const UsersPage = lazy(() => import('../pages/access-control/users'));
const RolesPage = lazy(() => import('../pages/access-control/roles'));
const RoleUsersPage = lazy(() => import('../pages/access-control/role-users'));
const PermissionsPage = lazy(() => import('../pages/PermissionsPage'));
const DepartmentsPage = lazy(() => import('../pages/DepartmentsPage'));
const DocumentsPage = lazy(() => import('../pages/documents'));
const CapaPage = lazy(() => import('../pages/CapaPage'));
const NcrPage = lazy(() => import('../pages/NcrPage'));
const AuditsPage = lazy(() => import('../pages/AuditsPage'));
const ReportsPage = lazy(() => import('../pages/reports'));
const SettingsPage = lazy(() => import('../pages/settings'));
const SmtpSettingsPage = lazy(() => import('../pages/SmtpSettingsPage'));
const StorageSettingsPage = lazy(() => import('../pages/StorageSettingsPage'));
const CompanyProfilePage = lazy(() => import('../pages/CompanyProfilePage'));
const MyProfilePage = lazy(() => import('../pages/MyProfilePage'));
const LoginAuditsPage = lazy(() => import('../pages/LoginAuditsPage'));
const ErrorLogsPage = lazy(() => import('../pages/ErrorLogsPage'));
const PageNotFound = lazy(() => import('../pages/PageNotFound'));

const CoursePage = lazy(() => import('../pages/course').then((m) => ({ default: m.CoursePage })));
const MyCoursesPage = lazy(() => import('../pages/course').then((m) => ({ default: m.MyCoursesPage })));
const AssignCoursePage = lazy(() => import('../pages/course').then((m) => ({ default: m.AssignCoursePage })));
const CourseSummaryPage = lazy(() => import('../pages/course').then((m) => ({ default: m.CourseSummaryPage })));
const LmsContentPage = lazy(() => import('../pages/course').then((m) => ({ default: m.LmsContentPage })));
const LmsAssignmentsPage = lazy(() => import('../pages/course').then((m) => ({ default: m.LmsAssignmentsPage })));
const LmsCheckingPage = lazy(() => import('../pages/course').then((m) => ({ default: m.LmsCheckingPage })));
const LmsTestSeriesPage = lazy(() => import('../pages/course').then((m) => ({ default: m.LmsTestSeriesPage })));
const TestSeriesBuilderPage = lazy(() => import('../pages/course').then((m) => ({ default: m.TestSeriesBuilderPage })));
const TestPlayerPage = lazy(() => import('../pages/course').then((m) => ({ default: m.TestPlayerPage })));
const CoursePlayerPage = lazy(() => import('../pages/course').then((m) => ({ default: m.CoursePlayerPage })));

export {
  LoginPage,
  ForgotPasswordPage,
  ChangePasswordPage,
  DashboardPage,
  UsersPage,
  RolesPage,
  RoleUsersPage,
  PermissionsPage,
  DepartmentsPage,
  DocumentsPage,
  CapaPage,
  NcrPage,
  AuditsPage,
  ReportsPage,
  SettingsPage,
  SmtpSettingsPage,
  StorageSettingsPage,
  CompanyProfilePage,
  MyProfilePage,
  LoginAuditsPage,
  ErrorLogsPage,
  PageNotFound,
  CoursePage,
  MyCoursesPage,
  AssignCoursePage,
  CourseSummaryPage,
  LmsContentPage,
  LmsAssignmentsPage,
  LmsCheckingPage,
  LmsTestSeriesPage,
  TestSeriesBuilderPage,
  TestPlayerPage,
  CoursePlayerPage,
};
