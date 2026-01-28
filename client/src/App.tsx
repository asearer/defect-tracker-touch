import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Layout from '@/components/Layout';
import OperatorDashboard from '@/pages/OperatorDashboard';
import QualityDashboard from '@/pages/QualityDashboard';
import AnalyticsDashboard from '@/pages/AnalyticsDashboard';
import { useAuth } from '@/context/AuthContext';
import React from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading } = useAuth();
    if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-950 text-white">Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="/operator" replace />} />
                    <Route path="operator" element={<OperatorDashboard />} />
                    <Route path="quality" element={<QualityDashboard />} />
                    <Route path="analytics" element={<AnalyticsDashboard />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
