import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AddDreamPage from './pages/AddDreamPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Routed() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/add-dream" replace /> : <LoginPage />}
      />
      <Route
        path="/add-dream"
        element={
          <ProtectedRoute>
            <AddDreamPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={token ? '/add-dream' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routed />
    </AuthProvider>
  );
}
