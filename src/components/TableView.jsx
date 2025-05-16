// components/TableView.jsx
import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import TableFilters from "./TableFilters";

const TableView = ({ bookings }) => {
  const [filteredData, setFilteredData] = useState(bookings);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'start_date', direction: 'desc' });
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    parkingName: "All",
    vehicleType: "All",
    searchTerm: "",
    status: "All"
  });
  
  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...bookings];
    
    // Filter by date range
    if (filters.dateRange.start && filters.dateRange.end) {
      const startTime = filters.dateRange.start.getTime();
      const endTime = filters.dateRange.end.getTime();
      
      filtered = filtered.filter(booking => {
        if (!booking.start_date || !booking.start_date.seconds) return false;
        const bookingTime = booking.start_date.seconds * 1000;
        return bookingTime >= startTime && bookingTime <= endTime;
      });
    }
    
    // Filter by parking name
    if (filters.parkingName !== "All") {
      filtered = filtered.filter(booking => booking.parking_name === filters.parkingName);
    }
    
    // Filter by vehicle type
    if (filters.vehicleType !== "All") {
      filtered = filtered.filter(booking => booking.vehicle_type === filters.vehicleType);
    }
    
    // Filter by status
    if (filters.status !== "All") {
      if (filters.status === "Active") {
        filtered = filtered.filter(booking => booking.status === true && booking.isCancel !== true);
      } else if (filters.status === "Cancelled") {
        filtered = filtered.filter(booking => booking.isCancel === true);
      }
    }
    
    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        (booking.name && booking.name.toLowerCase().includes(searchLower)) ||
        (booking.phone_no && booking.phone_no.includes(filters.searchTerm)) ||
        (booking.vehicle_number && booking.vehicle_number.toLowerCase().includes(searchLower)) ||
        (booking.token_no && booking.token_no.toString().includes(filters.searchTerm))
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Handle sorting for date fields
        if (sortConfig.key === 'start_date' || sortConfig.key === 'end_time') {
          const aValue = a[sortConfig.key]?.seconds || 0;
          const bValue = b[sortConfig.key]?.seconds || 0;
          
          if (sortConfig.direction === 'asc') {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        } 
        // Handle sorting for other fields
        else {
          const aValue = a[sortConfig.key] || '';
          const bValue = b[sortConfig.key] || '';
          
          if (sortConfig.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        }
      });
    }
    
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [bookings, filters, sortConfig]);
  
  const handleSort = (key) => {
    setSortConfig(prevConfig => {
      return {
        key,
        direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
      };
    });
  };
  
  const resetFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      parkingName: "All",
      vehicleType: "All",
      searchTerm: "",
      status: "All"
    });
    setSortConfig({ key: 'start_date', direction: 'desc' });
  };
  
  // Export functions
  const exportCSV = () => {
    // Create a formatted version of the data
    const formattedData = filteredData.map((item, idx) => {
      return {
        "Sr. No.": idx + 1,
        "Parking Name": item.parking_name || "",
        "Date & Time": item.start_date ? new Date(item.start_date.seconds * 1000).toLocaleString() : "",
        "Customer Name": item.name || "",
        "Contact Number": item.phone_no || "",
        "Vehicle Type": item.vehicle_type || "",
        "Vehicle Number": item.vehicle_number || "",
        "Machine ID": item.machine || "",
        "Pallet No.": item.pallet_no || "",
        "Token No.": item.token_no || "",
        "Status": item.isCancel ? "Cancelled" : (item.status ? "Active" : "Inactive"),
        "Booking Start Time": item.start_time ? new Date(item.start_time.seconds * 1000).toLocaleString() : "",
        "Booking End Time": item.end_time ? new Date(item.end_time.seconds * 1000).toLocaleString() : "",
        "Amount Received (₹)": item.amount || ""
      };
    });
    
    // Generate CSV
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `parking_bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
  };
  
  const exportExcel = () => {
    // Use the same formatted data as for CSV
    const formattedData = filteredData.map((item, idx) => {
      return {
        "Sr. No.": idx + 1,
        "Parking Name": item.parking_name || "",
        "Date & Time": item.start_date ? new Date(item.start_date.seconds * 1000).toLocaleString() : "",
        "Customer Name": item.name || "",
        "Contact Number": item.phone_no || "",
        "Vehicle Type": item.vehicle_type || "",
        "Vehicle Number": item.vehicle_number || "",
        "Machine ID": item.machine || "",
        "Pallet No.": item.pallet_no || "",
        "Token No.": item.token_no || "",
        "Status": item.isCancel ? "Cancelled" : (item.status ? "Active" : "Inactive"),
        "Booking Start Time": item.start_time ? new Date(item.start_time.seconds * 1000).toLocaleString() : "",
        "Booking End Time": item.end_time ? new Date(item.end_time.seconds * 1000).toLocaleString() : "",
        "Amount Received (₹)": item.amount || ""
      };
    });
    
    // Generate Excel
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
    saveAs(blob, `parking_bookings_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };
  
  // Get unique options for filters
  const getParkingOptions = () => {
    const parkingNames = new Set(bookings.map(b => b.parking_name).filter(Boolean));
    return ["All", ...parkingNames];
  };
  
  const getVehicleTypeOptions = () => {
    const vehicleTypes = new Set(bookings.map(b => b.vehicle_type).filter(Boolean));
    return ["All", ...vehicleTypes];
  };
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp.seconds) return "-";
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };
  
  // Column definitions for the table
  const columns = [
    { key: "sr_no", label: "Sr. No.", sortable: false },
    { key: "parking_name", label: "Parking Name", sortable: true },
    { key: "start_date", label: "Date & Time", sortable: true },
    { key: "name", label: "Customer Name", sortable: true },
    { key: "phone_no", label: "Contact Number", sortable: true },
    { key: "vehicle_type", label: "Vehicle Type", sortable: true },
    { key: "vehicle_number", label: "Vehicle Number", sortable: true },
    { key: "machine", label: "Machine ID", sortable: true },
    { key: "pallet_no", label: "Pallet No.", sortable: true },
    { key: "token_no", label: "Token No.", sortable: true },
    { key: "status", label: "Status", sortable: true },
    { key: "start_time", label: "Start Time", sortable: true },
    { key: "end_time", label: "End Time", sortable: true },
    { key: "amount", label: "Amount (₹)", sortable: true }
  ];
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Booking Records</h1>
        
        <div className="flex gap-2">
          <button 
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Export CSV
          </button>
          <button 
            onClick={exportExcel}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Export Excel
          </button>
        </div>
      </div>
      
      <TableFilters 
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        parkingOptions={getParkingOptions()}
        vehicleTypeOptions={getVehicleTypeOptions()}
      />
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map(column => (
                  <th 
                    key={column.key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && (
                        <button 
                          onClick={() => handleSort(column.key)}
                          className="ml-1 focus:outline-none"
                        >
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === 'asc' ? (
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            )
                          ) : (
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((booking, index) => (
                  <tr key={booking.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.parking_name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(booking.start_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.phone_no || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.vehicle_type || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.vehicle_number || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.machine || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.pallet_no || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.token_no || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.isCancel 
                          ? "bg-red-100 text-red-800" 
                          : booking.status 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                      }`}>
                        {booking.isCancel ? "Cancelled" : (booking.status ? "Active" : "Inactive")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(booking.start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(booking.end_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.amount ? `₹${booking.amount}` : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages || totalPages === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{filteredData.length > 0 ? indexOfFirstItem + 1 : 0}</span> to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredData.length)}
                </span>{" "}
                of <span className="font-medium">{filteredData.length}</span> results
              </p>
            </div>
            <div>
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-700">Items per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {[10, 25, 50, 100].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    currentPage === 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">First</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                    currentPage === 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page numbers */}
                {[...Array(totalPages).keys()].map(number => {
                  // Only show nearby pages, first, last and current
                  if (
                    number === 0 || 
                    number === totalPages - 1 || 
                    Math.abs(number + 1 - currentPage) <= 2
                  ) {
                    return (
                      <button
                        key={number}
                        onClick={() => setCurrentPage(number + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          currentPage === number + 1
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {number + 1}
                      </button>
                    );
                  }
                  
                  // Show ellipsis
                  if (
                    (number === 1 && currentPage > 4) ||
                    (number === totalPages - 2 && currentPage < totalPages - 3)
                  ) {
                    return (
                      <span
                        key={number}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  
                  return null;
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Last</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableView;