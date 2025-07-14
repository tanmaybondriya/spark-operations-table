// App.jsx
import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { fetchCollection, deleteDocument } from "./firestoreService";
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

  // Fetch bookings data
  const fetchBookings = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Set viewport meta tag to prevent zoom
  useEffect(() => {
    const setViewportMeta = () => {
      let viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
      }
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    };

    setViewportMeta();

    // Prevent zoom gestures and keyboard shortcuts
    const preventZoom = (e) => {
      // Prevent Ctrl/Cmd + scroll wheel zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
      
      // Prevent pinch zoom on touch devices
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventKeyboardZoom = (e) => {
      // Prevent Ctrl/Cmd + Plus/Minus/0 zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener('wheel', preventZoom, { passive: false });
    document.addEventListener('touchmove', preventZoom, { passive: false });
    document.addEventListener('keydown', preventKeyboardZoom);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('wheel', preventZoom);
      document.removeEventListener('touchmove', preventZoom);
      document.removeEventListener('keydown', preventKeyboardZoom);
    };
  }, []);

  // Main app with authentication wrapper
  return (
    <AuthProvider>
      <Router>
        <div style={{ 
          touchAction: 'pan-x pan-y',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}>
          <AppRoutes 
            bookings={bookings} 
            loading={loading} 
            error={error} 
            setBookings={setBookings} 
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

// Separate component for routes to access auth context within Router
const AppRoutes = ({ bookings, loading, error, setBookings }) => {
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
            <TableView bookings={bookings} setBookings={setBookings} />
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
    <div className="flex h-screen bg-gray-100" style={{ 
      touchAction: 'pan-x pan-y',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none'
    }}>
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