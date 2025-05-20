// App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { fetchCollection } from "./firestoreService";
import Dashboard from "./components/Dashboard";
import TableView from "./components/TableView";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./authContext.jsx";

const App = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchCollection("bookings");
        setBookings(data);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load booking data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Main app with authentication wrapper
  return (
    <AuthProvider>
      <Router>
        <AppRoutes bookings={bookings} loading={loading} error={error} />
      </Router>
    </AuthProvider>
  );
};

// Separate component for routes to access auth context within Router
const AppRoutes = ({ bookings, loading, error }) => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout bookings={bookings} loading={loading} error={error}>
            <Dashboard bookings={bookings} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/table" element={
        <ProtectedRoute>
          <MainLayout bookings={bookings} loading={loading} error={error}>
            <TableView bookings={bookings} />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Catch all route - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Layout component for authenticated pages
const MainLayout = ({ children, loading, error }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{error}</p>
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

export default App;