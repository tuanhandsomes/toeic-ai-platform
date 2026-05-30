import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { ROUTES } from '../constants/routes.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import PracticeList from '../pages/PracticeList.jsx';
import PracticeDetail from '../pages/PracticeDetail.jsx';
import FullTestList from '../pages/FullTestList.jsx';
import TestPreview from '../pages/TestPreview.jsx';
import ResultDetail from '../pages/ResultDetail.jsx';
import History from '../pages/History.jsx';
import Statistics from '../pages/Statistics.jsx';
import Profile from '../pages/Profile.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageTests from '../pages/admin/ManageTests.jsx';
import AdminTestDetail from '../pages/admin/AdminTestDetail.jsx';
import ManageQuestions from '../pages/admin/ManageQuestions.jsx';
import ManageMedia from '../pages/admin/ManageMedia.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';
import AdminUserDetail from '../pages/admin/AdminUserDetail.jsx';

export default function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  // Guest → landing page (marketing). Authenticated → đi thẳng vào app.
  const homeElement = !isAuthenticated ? (
    <LandingPage />
  ) : (
    <Navigate to={user?.role === 'admin' ? ROUTES.ADMIN : ROUTES.DASHBOARD} replace />
  );

  return (
    <Routes>
      <Route path={ROUTES.HOME} element={homeElement} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.PRACTICE} element={<PracticeList />} />
        <Route path={ROUTES.PRACTICE_DETAIL} element={<PracticeDetail />} />
        <Route path={ROUTES.FULL_TEST} element={<FullTestList />} />
        <Route path={ROUTES.FULL_TEST_DETAIL} element={<PracticeDetail />} />
        <Route path={ROUTES.TEST_PREVIEW} element={<TestPreview />} />
        <Route path={ROUTES.RESULTS} element={<History />} />
        <Route path={ROUTES.RESULT_DETAIL} element={<ResultDetail />} />
        <Route path={ROUTES.STATISTICS} element={<Statistics />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN_TESTS} element={<ManageTests />} />
        <Route path={ROUTES.ADMIN_TEST_DETAIL} element={<AdminTestDetail />} />
        <Route path={ROUTES.ADMIN_QUESTIONS} element={<ManageQuestions />} />
        <Route path={ROUTES.ADMIN_MEDIA} element={<ManageMedia />} />
        <Route path={ROUTES.ADMIN_USERS} element={<ManageUsers />} />
        <Route path={ROUTES.ADMIN_USER_DETAIL} element={<AdminUserDetail />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
