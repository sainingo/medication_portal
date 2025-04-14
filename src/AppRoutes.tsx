import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { PatientList } from './components/patients/PatientList';
import { PatientDetails } from './components/patients/PatientDetails';
import { DashboardOverview } from './components/DashboardOverview';
import { ReportsView } from './components/reports/ReportsView';
import Login from './components/auth/Login';
import { mockDashboardStats } from './lib/mockData';
import FormBuilder from './features/form-builder';
import ProtectedRoute from './components/ProtectedRoute';  // Import ProtectedRoute
import { useAuth } from './context/AuthContext';

export const AppRoutes = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);
   // Redirect authenticated users away from login page
   if (user && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  const isAuthenticated = !!user; 

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && isAuthenticated && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar - Responsive Design */}
      {isAuthenticated && (
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onNavigate={closeSidebar} />
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {isAuthenticated && (
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        )}
        
        <main className={`flex-1 overflow-y-auto ${isAuthenticated ? 'lg:pl-6' : ''}`}>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
                  <DashboardOverview />
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/patients" element={
              <ProtectedRoute>
                <PatientList />
              </ProtectedRoute>
            } />

            <Route path="/patients/details" element={
              <ProtectedRoute>
                <PatientDetails />
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportsView />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute>
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
                  <p className="text-gray-500">System configuration</p>
                </div>
              </ProtectedRoute>
            } />

            <Route path="/forms" element={
              <ProtectedRoute>
                <FormBuilder />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
};