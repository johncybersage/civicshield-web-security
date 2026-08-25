import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/ThemeProvider';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SecurityLab from './pages/SecurityLab';
import VerifyPhone from './pages/VerifyPhone';

import TrackComplaint from './pages/TrackComplaint';
import MyComplaints from './pages/MyComplaints';
import ComplaintDetail from './pages/ComplaintDetail';

import ErrorBoundary from './components/ErrorBoundary';

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center dark:bg-dark-bg"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center dark:bg-dark-bg"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;
  
  if (!user.is_phone_verified) {
    return <Navigate to="/verify-phone" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Redirect if not authorized
  }

  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  switch(user.role) {
    case 'CITIZEN': return <Navigate to="/citizen" />;
    case 'OFFICER': return <Navigate to="/officer" />;
    case 'ADMIN': return <Navigate to="/admin" />;
    default: return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-premium text-slate-900 dark:text-slate-100">
            <Navbar />
            <main className="flex-grow pt-16">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-phone" element={
                    // VerifyPhone should not be wrapped in ProtectedRoute because ProtectedRoute redirects TO verify-phone.
                    // But it needs to check if the user is logged in. 
                    <RequireAuth>
                      <VerifyPhone />
                    </RequireAuth>
                  } />
                  
                  <Route path="/track" element={<TrackComplaint />} />
                  <Route path="/my-complaints" element={
                    <ProtectedRoute allowedRoles={['CITIZEN']}>
                      <MyComplaints />
                    </ProtectedRoute>
                  } />
                  <Route path="/complaints/:trackingId" element={
                    <RequireAuth>
                      <ComplaintDetail />
                    </RequireAuth>
                  } />
                  
                  <Route path="/dashboard" element={<DashboardRouter />} />
                  <Route path="/citizen/*" element={
                    <ProtectedRoute allowedRoles={['CITIZEN']}>
                      <CitizenDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/officer/*" element={
                    <ProtectedRoute allowedRoles={['OFFICER', 'ADMIN']}>
                      <OfficerDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/*" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/security-lab" element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'OFFICER']}>
                      <SecurityLab />
                    </ProtectedRoute>
                  } />
                </Routes>
              </ErrorBoundary>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
