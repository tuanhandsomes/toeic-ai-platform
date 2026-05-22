import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { ROUTES } from '../constants/routes.js';
import ProtectedRoute from './ProtectedRoute.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import PracticeList from '../pages/PracticeList.jsx';
import PracticeDetail from '../pages/PracticeDetail.jsx';
import FullTestList from '../pages/FullTestList.jsx';
import ResultDetail from '../pages/ResultDetail.jsx';
import History from '../pages/History.jsx';
import Statistics from '../pages/Statistics.jsx';
import Profile from '../pages/Profile.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import ManageTests from '../pages/admin/ManageTests.jsx';
import ManageQuestions from '../pages/admin/ManageQuestions.jsx';
import ManageUsers from '../pages/admin/ManageUsers.jsx';

export default function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const homeRedirect = !isAuthenticated
    ? ROUTES.LOGIN
    : user?.role === 'admin'
      ? ROUTES.ADMIN
      : ROUTES.DASHBOARD;

  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Navigate to={homeRedirect} replace />} />
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
        <Route path={ROUTES.PRACTICE} element={<PracticeList />} />
        <Route path={ROUTES.PRACTICE_DETAIL} element={<PracticeDetail />} />
        <Route path={ROUTES.FULL_TEST} element={<FullTestList />} />
        <Route path={ROUTES.FULL_TEST_DETAIL} element={<PracticeDetail />} />
        <Route path={ROUTES.RESULTS} element={<History />} />
        <Route path={ROUTES.RESULT_DETAIL} element={<ResultDetail />} />
        <Route path={ROUTES.STATISTICS} element={<Statistics />} />
        <Route path={ROUTES.PROFILE} element={<Profile />} />
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
        <Route path={ROUTES.ADMIN_TESTS} element={<ManageTests />} />
        <Route path={ROUTES.ADMIN_QUESTIONS} element={<ManageQuestions />} />
        <Route path={ROUTES.ADMIN_USERS} element={<ManageUsers />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
