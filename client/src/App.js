import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ItemDetailPage from './pages/ItemDetailPage';
import PostItemPage from './pages/PostItemPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const GuestRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="page flex items-center justify-center">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/items/:id" element={<ItemDetailPage />} />

                <Route path="/login" element={
                    <GuestRoute>
                        <LoginPage />
                    </GuestRoute>
                } />
                <Route path="/signup" element={
                    <GuestRoute>
                        <SignupPage />
                    </GuestRoute>
                } />

                <Route path="/post" element={
                    <ProtectedRoute>
                        <PostItemPage />
                    </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                } />

                <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                        <AdminPage />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <AppRoutes />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1a1a25',
                            color: '#f8fafc',
                            border: '1px solid #2d2d3d'
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#1a1a25'
                            }
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#1a1a25'
                            }
                        }
                    }}
                />
            </Router>
        </AuthProvider>
    );
}

export default App;
