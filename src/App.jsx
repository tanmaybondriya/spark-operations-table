// App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { fetchCollection } from "./firestoreService";
import Dashboard from "./components/Dashboard";
import TableView from "./components/TableView";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

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

  return (
    <Router>
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
              <Routes>
                <Route path="/" element={<Dashboard bookings={bookings} />} />
                <Route path="/table" element={<TableView bookings={bookings} />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;