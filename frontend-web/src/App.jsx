import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VeterinariesPage from './pages/VeterinariesPage';
import PetsPage from './pages/PetsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import UsersManagementPage from './pages/admin/UsersManagementPage';
import PermissionsPage from './pages/admin/PermissionsPage';
import LogsPage from './pages/admin/LogsPage';
import LogStatsPage from './pages/admin/LogStatsPage';
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
            
            {/* Rutas de veterinarias */}
            <Route 
              path="/veterinaries" 
              element={
                <ProtectedRoute requiredPermissions={['veterinaries.mine.view']}>
                  <VeterinariesPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de mascotas */}
            <Route 
              path="/pets" 
              element={
                <ProtectedRoute>
                  <PetsPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Rutas de citas */}
            <Route 
              path="/appointments" 
              element={
                <ProtectedRoute>
                  <AppointmentsPage />
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
            <Route 
              path="/admin/logs" 
              element={
                <ProtectedRoute requiredPermissions={['logs.view']}>
                  <LogsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/logs/stats" 
              element={
                <ProtectedRoute requiredPermissions={['logs.view']}>
                  <LogStatsPage />
                </ProtectedRoute>
              } 
            />
            
            
            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
