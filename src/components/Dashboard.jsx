// components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import FilterBar from "./FilterBar";
import StatusCard from "./StatusCard";

const Dashboard = ({ bookings }) => {
  const navigate = useNavigate();
  const [filteredData, setFilteredData] = useState(bookings);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedParking, setSelectedParking] = useState("All");

  useEffect(() => {
    applyFilters();
  }, [bookings, dateRange, selectedParking]);

  const applyFilters = () => {
    let filtered = [...bookings];
    
    // Filter by parking name
    if (selectedParking !== "All") {
      filtered = filtered.filter(booking => booking.parking_name === selectedParking);
    }
    
    // Filter by date range
    if (dateRange.start && dateRange.end) {
      const startTime = dateRange.start.getTime();
      const endTime = dateRange.end.getTime();
      
      filtered = filtered.filter(booking => {
        if (!booking.start_date || !booking.start_date.seconds) return false;
        const bookingTime = booking.start_date.seconds * 1000;
        return bookingTime >= startTime && bookingTime <= endTime;
      });
    }
    
    setFilteredData(filtered);
  };

  // Calculate stats
  const totalBookings = filteredData.length;
  const activeBookings = filteredData.filter(b => b.status === true && b.isCancel !== true).length;
  const cancelledBookings = filteredData.filter(b => b.isCancel === true).length;
  const totalRevenue = filteredData.reduce((sum, booking) => sum + (parseInt(booking.amount) || 0), 0);

  // Parking-wise distribution for Pie Chart
  const getParkingDistribution = () => {
    const parkingCounts = {};
    
    filteredData.forEach(booking => {
      const parkingName = booking.parking_name || "Unknown";
      parkingCounts[parkingName] = (parkingCounts[parkingName] || 0) + 1;
    });
    
    return Object.entries(parkingCounts).map(([name, count]) => ({
      name: name,
      value: count
    }));
  };

  // Vehicle type distribution for Pie Chart
  const getVehicleTypeDistribution = () => {
    const vehicleCounts = {};
    
    filteredData.forEach(booking => {
      const vehicleType = booking.vehicle_type || "Unknown";
      vehicleCounts[vehicleType] = (vehicleCounts[vehicleType] || 0) + 1;
    });
    
    return Object.entries(vehicleCounts).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  // Daily booking trend for Line Chart
  const getDailyBookingTrend = () => {
    const bookingsByDate = {};
    
    filteredData.forEach(booking => {
      if (!booking.start_date || !booking.start_date.seconds) return;
      
      const date = new Date(booking.start_date.seconds * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      bookingsByDate[dateStr] = (bookingsByDate[dateStr] || 0) + 1;
    });
    
    // Sort by date
    return Object.entries(bookingsByDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({
        date: date.slice(5), // Show only MM-DD
        bookings: count
      }))
      .slice(-14); // Last 14 days
  };

  // Revenue by parking for Bar Chart
  const getRevenueByParking = () => {
    const revenueByParking = {};
    
    filteredData.forEach(booking => {
      const parkingName = booking.parking_name || "Unknown";
      const amount = parseInt(booking.amount) || 0;
      
      revenueByParking[parkingName] = (revenueByParking[parkingName] || 0) + amount;
    });
    
    return Object.entries(revenueByParking).map(([name, amount]) => ({
      name: name.length > 10 ? name.substring(0, 10) + "..." : name,
      revenue: amount
    }));
  };

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Get list of unique parking names for filter
  const getParkingOptions = () => {
    const parkingNames = new Set(bookings.map(b => b.parking_name).filter(Boolean));
    return ["All", ...parkingNames];
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Overview</h1>
      
      <FilterBar 
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedParking={selectedParking}
        setSelectedParking={setSelectedParking}
        parkingOptions={getParkingOptions()}
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatusCard 
          title="Total Bookings" 
          value={totalBookings}
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
          </svg>}
          color="blue"
          onClick={() => navigate('/table')}
        />
        <StatusCard 
          title="Active Bookings" 
          value={activeBookings}
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>}
          color="green"
          onClick={() => {
            // Navigate to table view with active filter
            navigate('/table', { 
              state: { 
                initialFilters: {
                  dateRange: dateRange,
                  parkingName: selectedParking,
                  vehicleType: "All",
                  searchTerm: "",
                  status: "Active"
                }
              }
            });
          }}
        />
        <StatusCard 
          title="Cancelled Bookings" 
          value={cancelledBookings}
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>}
          color="red"
          onClick={() => {
            // Navigate to table view with cancelled filter
            navigate('/table', { 
              state: { 
                initialFilters: {
                  dateRange: dateRange,
                  parkingName: selectedParking,
                  vehicleType: "All",
                  searchTerm: "",
                  status: "Cancelled"
                }
              }
            });
          }}
        />
        <StatusCard 
          title="Total Revenue" 
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>}
          color="amber"
          onClick={() => navigate('/table')}
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Booking Trend */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Daily Booking Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getDailyBookingTrend()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#3B82F6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Revenue by Parking */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Revenue by Parking</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getRevenueByParking()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parking Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Parking Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getParkingDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getParkingDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} bookings`, props.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Vehicle Type Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Vehicle Type Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getVehicleTypeDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getVehicleTypeDistribution().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value} vehicles`, props.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;