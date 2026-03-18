import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';

const Router = import.meta.env.VITE_USE_MOCK === 'true' ? HashRouter : BrowserRouter;
import { AuthProvider, useAuth } from './hooks/useAuth';
import { SessionProvider } from './hooks/useSession';
import LoginPage from './pages/LoginPage';
import VisitorPage from './pages/VisitorPage';
import AdminPage from './pages/AdminPage';

// Protected route wrapper
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'visitor' | 'admin';
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Laddar...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate page based on role
    return <Navigate to={user.role === 'admin' ? '/admin' : '/visitor'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'admin' ? '/admin' : '/visitor'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/visitor"
        element={
          <ProtectedRoute requiredRole="visitor">
            <VisitorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SessionProvider>
          <AppRoutes />
        </SessionProvider>
      </AuthProvider>
    </Router>
  );
}
