// components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
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
      filtered = filtered.filter(
        (booking) => booking.parking_name === selectedParking
      );
    }

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      // Ensure start time is at beginning of day (00:00:00)
      const startTime = new Date(dateRange.start);
      startTime.setHours(0, 0, 0, 0);

      // Ensure end time is at end of day (23:59:59.999)
      const endTime = new Date(dateRange.end);
      endTime.setHours(23, 59, 59, 999);

      filtered = filtered.filter((booking) => {
        if (!booking.start_date || !booking.start_date.seconds) return false;
        const bookingTime = booking.start_date.seconds * 1000;
        return (
          bookingTime >= startTime.getTime() && bookingTime <= endTime.getTime()
        );
      });
    }

    setFilteredData(filtered);
  };

  // Calculate stats
  const totalBookings = filteredData.length;
  const activeBookings = filteredData.filter((booking) => {
    // Check if booking is not cancelled and has active status
    if (booking.isCancel === true || booking.status !== true) {
      return false;
    }

    // If booking has start_time and end_time, check if current time is within the booking period
    if (booking.start_time && booking.end_time) {
      const now = new Date().getTime();
      const startTime = booking.start_time.seconds * 1000;
      const endTime = booking.end_time.seconds * 1000;

      // Booking is active if current time is between start and end time
      return now >= startTime && now <= endTime;
    }

    // If no time range is specified, consider it active if status is true and not cancelled
    return true;
  }).length;

  const totalRevenue = filteredData.reduce(
    (sum, booking) => sum + (parseInt(booking.amount) || 0),
    0
  );

  // Calculate daily revenue (today's bookings)
  const dailyRevenue = (() => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    return filteredData
      .filter((booking) => {
        if (!booking.start_date || !booking.start_date.seconds) return false;
        const bookingDate = new Date(booking.start_date.seconds * 1000);
        return bookingDate >= todayStart && bookingDate < todayEnd;
      })
      .reduce((sum, booking) => sum + (parseInt(booking.amount) || 0), 0);
  })();
  // Parking-wise distribution for Pie Chart
  const getParkingDistribution = () => {
    const parkingCounts = {};

    filteredData.forEach((booking) => {
      const parkingName = booking.parking_name || "Unknown";
      parkingCounts[parkingName] = (parkingCounts[parkingName] || 0) + 1;
    });

    return Object.entries(parkingCounts).map(([name, count]) => ({
      name: name,
      value: count,
    }));
  };

  // Vehicle type distribution for Pie Chart
  const getVehicleTypeDistribution = () => {
    const vehicleCounts = {};

    filteredData.forEach((booking) => {
      const vehicleType = booking.vehicle_type || "Unknown";
      vehicleCounts[vehicleType] = (vehicleCounts[vehicleType] || 0) + 1;
    });

    return Object.entries(vehicleCounts).map(([type, count]) => ({
      name: type,
      value: count,
    }));
  };

  // Daily booking trend for Line Chart
  const getDailyBookingTrend = () => {
    const bookingsByDate = {};

    filteredData.forEach((booking) => {
      if (!booking.start_date || !booking.start_date.seconds) return;

      const date = new Date(booking.start_date.seconds * 1000);
      const dateStr = date.toISOString().split("T")[0];

      bookingsByDate[dateStr] = (bookingsByDate[dateStr] || 0) + 1;
    });

    // Sort by date
    return Object.entries(bookingsByDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, count]) => ({
        date: date.slice(5), // Show only MM-DD
        bookings: count,
      }))
      .slice(-14); // Last 14 days
  };

  // Daily revenue trend for Bar Chart
  const getDailyRevenueTrend = () => {
    const revenueByDate = {};

    filteredData.forEach((booking) => {
      if (!booking.start_date || !booking.start_date.seconds) return;

      const date = new Date(booking.start_date.seconds * 1000);
      const dateStr = date.toISOString().split("T")[0];
      const amount = parseInt(booking.amount) || 0;

      revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + amount;
    });

    // Sort by date and format for display
    return Object.entries(revenueByDate)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, amount]) => {
        const dateObj = new Date(date);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = String(dateObj.getFullYear()).slice(-2);

        return {
          date: `${day}/${month}/${year}`, // Format as dd/mm/yy
          revenue: amount,
        };
      })
      .slice(-14); // Last 14 days
  };

  // Chart colors
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  // Get list of unique parking names for filter
  const getParkingOptions = () => {
    const parkingNames = new Set(
      bookings.map((b) => b.parking_name).filter(Boolean)
    );
    return ["All", ...parkingNames];
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">
        Dashboard Overview
      </h1>

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
          icon={
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              ></path>
            </svg>
          }
          color="blue"
          onClick={() => navigate("/table")}
        />
        <StatusCard
          title="Active Bookings"
          value={activeBookings}
          icon={
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          }
          color="green"
          onClick={() => {
            // Navigate to table view with active filter
            navigate("/table", {
              state: {
                initialFilters: {
                  dateRange: dateRange,
                  parkingName: selectedParking,
                  vehicleType: "All",
                  searchTerm: "",
                  status: "Active",
                },
              },
            });
          }}
        />

        <StatusCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          }
          color="amber"
          onClick={() => navigate("/table")}
        />
        <StatusCard
          title="Daily Revenue"
          value={`₹${dailyRevenue.toLocaleString()}`}
          icon={
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
          }
          color="purple"
          onClick={() => {
            // Navigate to table view with today's filter
            const today = new Date();
            const todayStart = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            );
            const todayEnd = new Date(
              todayStart.getTime() + 24 * 60 * 60 * 1000
            );
            todayEnd.setHours(23, 59, 59, 999);

            navigate("/table", {
              state: {
                initialFilters: {
                  dateRange: { start: todayStart, end: todayEnd },
                  parkingName: selectedParking,
                  vehicleType: "All",
                  searchTerm: "",
                  status: "All",
                },
              },
            });
          }}
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
                <YAxis
                  interval={0}
                  tickFormatter={(value) => Math.round(value)}
                  domain={[0, "dataMax"]}
                  ticks={(() => {
                    const data = getDailyBookingTrend();
                    const maxValue = Math.max(
                      ...data.map((d) => d.bookings),
                      0
                    );
                    const maxTick = Math.ceil(maxValue / 10) * 10;
                    const ticks = [];
                    for (let i = 0; i <= maxTick; i += 10) {
                      ticks.push(i);
                    }
                    return ticks;
                  })()}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Daily Revenue Trend</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getDailyRevenueTrend()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis
                  interval={0}
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                  domain={[0, "dataMax"]}
                  ticks={(() => {
                    const data = getDailyRevenueTrend();
                    const maxValue = Math.max(...data.map((d) => d.revenue), 0);

                    // Determine appropriate interval based on max value
                    let interval;
                    if (maxValue <= 10000) {
                      interval = 2000;
                    } else if (maxValue <= 50000) {
                      interval = 10000;
                    } else if (maxValue <= 100000) {
                      interval = 20000;
                    } else {
                      interval = 50000;
                    }

                    const maxTick = Math.ceil(maxValue / interval) * interval;
                    const ticks = [];
                    for (let i = 0; i <= maxTick; i += interval) {
                      ticks.push(i);
                    }
                    return ticks;
                  })()}
                />
                <Tooltip
                  formatter={(value) => [
                    `₹${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />
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
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getParkingDistribution().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} bookings`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Type Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">
            Vehicle Type Distribution
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getVehicleTypeDistribution()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getVehicleTypeDistribution().map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value} vehicles`,
                    props.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
