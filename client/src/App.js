import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ContentGenerator from './pages/ContentGenerator';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Router>
          <div className="App min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/generate" 
                  element={
                    <PrivateRoute>
                      <ContentGenerator />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <PrivateRoute>
                      <Analytics />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid #475569'
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#ffffff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#ffffff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;
