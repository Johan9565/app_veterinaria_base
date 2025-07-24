import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UsersManagementPage from './pages/admin/UsersManagementPage';
import PermissionsPage from './pages/PermissionsPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Rutas protegidas */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de administración */}
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredPermissions={['users.view']}>
                  <UsersManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/permissions" 
              element={
                <ProtectedRoute requiredPermissions={['permissions.view']}>
                  <PermissionsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
