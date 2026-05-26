import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import AppRoutes from './routes/AppRoutes.jsx';
import { useAuthStore } from './store/authStore.js';

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <BrowserRouter>
      <AppRoutes />
      {/* Toast notifications — richColors cho color-coded success/error/warning */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={4000}
      />
    </BrowserRouter>
  );
}
