// components/TableView.jsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import TableFilters from "./TableFilters";
import { deleteDocument } from "../firestoreService";
import Toast from "./Toast";
import DeleteModal from "./DeleteModal";

const TableView = ({ bookings, setBookings }) => {
  const location = useLocation();
  const initialFilters = location.state?.initialFilters;

  const [filteredData, setFilteredData] = useState(bookings);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({
    key: "start_date",
    direction: "desc",
  });
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    parkingName: "All",
    vehicleType: "All",
    searchTerm: "",
    status: "All",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // stores the ID of the booking to delete
  const [toast, setToast] = useState(null); // for toast notifications

  // Apply initial filters if provided
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  // Update filteredData when bookings change
  useEffect(() => {
    setFilteredData(bookings);
  }, [bookings]);

  // Handle delete booking
  const handleDeleteBooking = async (bookingId) => {
    if (!bookingId) {
      console.error("No booking ID provided for deletion");
      setDeleteError("Invalid booking information. Please try again.");
      return;
    }

    console.log("Deleting booking ID:", bookingId);
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Perform the delete operation
      const result = await deleteDocument("bookings", bookingId);
      console.log("Delete result:", result);

      // Update the filtered data first (local component state)
      setFilteredData((prevFiltered) =>
        prevFiltered.filter((booking) => booking.id !== bookingId)
      );

      // Then update the parent component state if setBookings exists
      if (typeof setBookings === "function") {
        setBookings((prev) =>
          prev.filter((booking) => booking.id !== bookingId)
        );
      }

      // Close the confirmation dialog
      setShowDeleteConfirm(null);

      // Show success toast
      setToast({
        message: "Booking deleted successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting booking:", error);
      setDeleteError(`Failed to delete booking: ${error.message}`);

      // Show error toast
      setToast({
        message: `Failed to delete booking: ${error.message}`,
        type: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...bookings];

    // Filter by date range
    if (filters.dateRange.start && filters.dateRange.end) {
      // Ensure start time is at beginning of day (00:00:00)
      const startTime = new Date(filters.dateRange.start);
      startTime.setHours(0, 0, 0, 0);

      // Ensure end time is at end of day (23:59:59.999)
      const endTime = new Date(filters.dateRange.end);
      endTime.setHours(23, 59, 59, 999);

      filtered = filtered.filter((booking) => {
        if (!booking.start_date || !booking.start_date.seconds) return false;
        const bookingTime = booking.start_date.seconds * 1000;
        return (
          bookingTime >= startTime.getTime() && bookingTime <= endTime.getTime()
        );
      });
    }

    // Filter by parking name
    if (filters.parkingName !== "All") {
      filtered = filtered.filter(
        (booking) => booking.parking_name === filters.parkingName
      );
    }

    // Filter by vehicle type
    if (filters.vehicleType !== "All") {
      filtered = filtered.filter(
        (booking) => booking.vehicle_type === filters.vehicleType
      );
    }

    // Filter by status
    if (filters.status !== "All") {
      if (filters.status === "Active") {
        filtered = filtered.filter((booking) => {
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
        });
      } else if (filters.status === "Cancelled") {
        filtered = filtered.filter((booking) => booking.isCancel === true);
      }
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          (booking.name && booking.name.toLowerCase().includes(searchLower)) ||
          (booking.phone_no && booking.phone_no.includes(filters.searchTerm)) ||
          (booking.vehicle_number &&
            booking.vehicle_number.toLowerCase().includes(searchLower)) ||
          (booking.token_no &&
            booking.token_no.toString().includes(filters.searchTerm))
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        // Handle sorting for date fields
        if (sortConfig.key === "start_date" || sortConfig.key === "end_time") {
          const aValue = a[sortConfig.key]?.seconds || 0;
          const bValue = b[sortConfig.key]?.seconds || 0;

          if (sortConfig.direction === "asc") {
            return aValue - bValue;
          } else {
            return bValue - aValue;
          }
        }
        // Handle sorting for other fields
        else {
          const aValue = a[sortConfig.key] || "";
          const bValue = b[sortConfig.key] || "";

          if (sortConfig.direction === "asc") {
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
    setSortConfig((prevConfig) => {
      return {
        key,
        direction:
          prevConfig.key === key && prevConfig.direction === "asc"
            ? "desc"
            : "asc",
      };
    });
  };

  const resetFilters = () => {
    setFilters({
      dateRange: { start: null, end: null },
      parkingName: "All",
      vehicleType: "All",
      searchTerm: "",
      status: "All",
    });
    setSortConfig({ key: "start_date", direction: "desc" });
  };

  // Export functions
  const exportCSV = () => {
    // Create a formatted version of the data
    const formattedData = filteredData.map((item, idx) => {
      return {
        "Sr. No.": idx + 1,
        "Parking Name": item.parking_name || "",
        "Date & Time": item.start_date ? formatTimestamp(item.start_date) : "",
        "Customer Name": item.name || "",
        "Contact Number": item.phone_no || "",
        "Vehicle Type": item.vehicle_type || "",
        "Vehicle Number": item.vehicle_number || "",
        "Machine ID": item.machine || "",
        "Pallet No.": item.pallet_no || "",
        "Token No.": item.token_no || "",
        Status: item.isCancel
          ? "Cancelled"
          : (() => {
              if (item.status !== true) return "Inactive";

              // Check if booking is currently active based on time
              if (item.start_time && item.end_time) {
                const now = new Date().getTime();
                const startTime = item.start_time.seconds * 1000;
                const endTime = item.end_time.seconds * 1000;

                if (now >= startTime && now <= endTime) {
                  return "Active";
                } else if (now > endTime) {
                  return "Completed";
                } else {
                  return "Scheduled";
                }
              }

              return "Active"; // Default active
            })(),
        "Booking Start Time": item.start_time
          ? formatTimestamp(item.start_time)
          : "",
        "Booking End Time": item.end_time ? formatTimestamp(item.end_time) : "",
        "Amount Received (₹)": item.amount || "",
      };
    });

    // Generate CSV
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(
      blob,
      `parking_bookings_export_${(() => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
      })()}.csv`
    );
  };

  // Enhanced export functions with WebView support
  const exportExcel = () => {
    try {
      // Use the same formatted data as before
      const formattedData = filteredData.map((item, idx) => {
        return {
          "Sr. No.": idx + 1,
          "Parking Name": item.parking_name || "",
          "Date & Time": item.start_date
            ? formatTimestamp(item.start_date)
            : "",
          "Customer Name": item.name || "",
          "Contact Number": item.phone_no || "",
          "Vehicle Type": item.vehicle_type || "",
          "Vehicle Number": item.vehicle_number || "",
          "Machine ID": item.machine || "",
          "Pallet No.": item.pallet_no || "",
          "Token No.": item.token_no || "",
          Status: item.isCancel
            ? "Cancelled"
            : (() => {
                if (item.status !== true) return "Inactive";

                // Check if booking is currently active based on time
                if (item.start_time && item.end_time) {
                  const now = new Date().getTime();
                  const startTime = item.start_time.seconds * 1000;
                  const endTime = item.end_time.seconds * 1000;

                  if (now >= startTime && now <= endTime) {
                    return "Active";
                  } else if (now > endTime) {
                    return "Completed";
                  } else {
                    return "Scheduled";
                  }
                }

                return "Active"; // Default active
              })(),
          "Booking Start Time": item.start_time
            ? formatTimestamp(item.start_time)
            : "",
          "Booking End Time": item.end_time
            ? formatTimestamp(item.end_time)
            : "",
          "Amount Received (₹)": item.amount || "",
        };
      });

      // Generate Excel
      const ws = XLSX.utils.json_to_sheet(formattedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bookings");

      const fileName = `parking_bookings_export_${(() => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = String(now.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
      })()}.xlsx`;

      // Method 1: Try standard download first
      try {
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, fileName);
        return;
      } catch (error) {
        console.log(
          "Standard download failed, trying alternative methods...",
          error
        );
      }

      // Method 2: Try direct download link approach
      try {
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
        return;
      } catch (error) {
        console.log("Direct download failed, trying base64 method...", error);
      }

      // Method 3: Base64 data URL approach (works better in some WebViews)
      try {
        const excelBuffer = XLSX.write(wb, {
          bookType: "xlsx",
          type: "base64",
        });
        const dataURL = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBuffer}`;

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = fileName;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      } catch (error) {
        console.log("Base64 download failed, trying window.open...", error);
      }

      // Method 4: Open in new window/tab (fallback)
      try {
        const excelBuffer = XLSX.write(wb, {
          bookType: "xlsx",
          type: "base64",
        });
        const dataURL = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBuffer}`;
        window.open(dataURL, "_blank");
        return;
      } catch (error) {
        console.log("Window.open failed, trying postMessage...", error);
      }

      // Method 5: PostMessage to parent (for embedded WebViews)
      try {
        const excelBuffer = XLSX.write(wb, {
          bookType: "xlsx",
          type: "base64",
        });

        // Try to communicate with parent window/app
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            {
              type: "DOWNLOAD_FILE",
              data: excelBuffer,
              fileName: fileName,
              mimeType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
            "*"
          );

          // Show success message
          setToast({
            message: "Export initiated. Please check your downloads.",
            type: "success",
          });
          return;
        }

        // Try Android WebView interface
        if (window.Android && window.Android.downloadFile) {
          window.Android.downloadFile(
            excelBuffer,
            fileName,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          );
          setToast({
            message: "Export initiated. Please check your downloads.",
            type: "success",
          });
          return;
        }

        // Try iOS WebView interface
        if (
          window.webkit &&
          window.webkit.messageHandlers &&
          window.webkit.messageHandlers.downloadFile
        ) {
          window.webkit.messageHandlers.downloadFile.postMessage({
            data: excelBuffer,
            fileName: fileName,
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          setToast({
            message: "Export initiated. Please check your downloads.",
            type: "success",
          });
          return;
        }
      } catch (error) {
        console.log("PostMessage failed...", error);
      }

      // If all methods fail, show error
      setToast({
        message: "Export failed. Please try using a regular browser.",
        type: "error",
      });
    } catch (error) {
      console.error("Excel export error:", error);
      setToast({
        message: `Export failed: ${error.message}`,
        type: "error",
      });
    }
  };

  // Get unique options for filters
  const getParkingOptions = () => {
    const parkingNames = new Set(
      bookings.map((b) => b.parking_name).filter(Boolean)
    );
    return ["All", ...parkingNames];
  };

  const getVehicleTypeOptions = () => {
    const vehicleTypes = new Set(
      bookings.map((b) => b.vehicle_type).filter(Boolean)
    );
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
    const date = new Date(timestamp.seconds * 1000);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // Column definitions for the table (used for headers on larger screens, and labels on smaller)
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
    { key: "amount", label: "Amount (₹)", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  return (
    <div className="p-4 sm:p-6 mb-30">
      {" "}
      {/* Added padding for better mobile spacing */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
          Booking Records
        </h1>

        <div className="hidden sm:flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {" "}
          {/* Hide buttons on mobile */}
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
          >
            Export CSV
          </button>
          <button
            onClick={exportExcel}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
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
        {/* Table for larger screens */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="ml-1 focus:outline-none"
                        >
                          {sortConfig.key === column.key ? (
                            sortConfig.direction === "asc" ? (
                              <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 15l7-7 7 7"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                ></path>
                              </svg>
                            )
                          ) : (
                            <svg
                              className="w-4 h-4 text-gray-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                              ></path>
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
                  <tr
                    key={booking.id || index}
                    className={`hover:bg-gray-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-100"
                    }`}
                  >
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.parking_name || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(booking.start_date)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {booking.name || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {booking.phone_no || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {booking.vehicle_type || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {booking.vehicle_number || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {booking.machine || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {booking.pallet_no || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {booking.token_no || "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          booking.isCancel
                            ? "bg-red-100 text-red-800"
                            : (() => {
                                if (booking.status !== true)
                                  return "bg-gray-100 text-gray-800";

                                // Check if booking is currently active based on time
                                if (booking.start_time && booking.end_time) {
                                  const now = new Date().getTime();
                                  const startTime =
                                    booking.start_time.seconds * 1000;
                                  const endTime =
                                    booking.end_time.seconds * 1000;

                                  if (now >= startTime && now <= endTime) {
                                    return "bg-green-100 text-green-800"; // Active
                                  } else if (now > endTime) {
                                    return "bg-blue-100 text-blue-800"; // Completed
                                  } else {
                                    return "bg-yellow-100 text-yellow-800"; // Scheduled
                                  }
                                }

                                return "bg-green-100 text-green-800"; // Default active
                              })()
                        }`}
                      >
                        {booking.isCancel
                          ? "Cancelled"
                          : (() => {
                              if (booking.status !== true) return "Inactive";

                              // Check if booking is currently active based on time
                              if (booking.start_time && booking.end_time) {
                                const now = new Date().getTime();
                                const startTime =
                                  booking.start_time.seconds * 1000;
                                const endTime = booking.end_time.seconds * 1000;

                                if (now >= startTime && now <= endTime) {
                                  return "Active";
                                } else if (now > endTime) {
                                  return "Completed";
                                } else {
                                  return "Scheduled";
                                }
                              }

                              return "Active"; // Default active
                            })()}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(booking.start_time)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(booking.end_time)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                      {booking.amount ? `₹${booking.amount}` : "-"}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setShowDeleteConfirm(booking.id)}
                        className="text-red-600 hover:text-red-900 focus:outline-none"
                        title="Delete booking"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-3 py-2 text-center text-sm text-gray-500"
                  >
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Card-based layout for small screens */}
        <div className="sm:hidden p-4">
          {currentItems.length > 0 ? (
            currentItems.map((booking, index) => (
              <div
                key={booking.id || index}
                className="bg-white shadow rounded-lg p-4 mb-4 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    Booking #{indexOfFirstItem + index + 1}
                  </h3>
                  <button
                    onClick={() => setShowDeleteConfirm(booking.id)}
                    className="text-red-600 hover:text-red-900 focus:outline-none"
                    title="Delete booking"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
                {columns.map((column) => {
                  if (column.key === "sr_no" || column.key === "actions")
                    return null; // Handled separately
                  let displayValue;
                  switch (column.key) {
                    case "start_date":
                    case "start_time":
                    case "end_time":
                      displayValue = formatTimestamp(booking[column.key]);
                      break;
                    case "status":
                      displayValue = booking.isCancel
                        ? "Cancelled"
                        : (() => {
                            if (booking.status !== true) return "Inactive";

                            // Check if booking is currently active based on time
                            if (booking.start_time && booking.end_time) {
                              const now = new Date().getTime();
                              const startTime =
                                booking.start_time.seconds * 1000;
                              const endTime = booking.end_time.seconds * 1000;

                              if (now >= startTime && now <= endTime) {
                                return "Active";
                              } else if (now > endTime) {
                                return "Completed";
                              } else {
                                return "Scheduled";
                              }
                            }

                            return "Active"; // Default active
                          })();
                      break;
                    case "amount":
                      displayValue = booking.amount
                        ? `₹${booking.amount}`
                        : "-";
                      break;
                    default:
                      displayValue = booking[column.key] || "-";
                  }
                  return (
                    <div
                      key={column.key}
                      className="flex justify-between py-1 text-sm"
                    >
                      <span className="font-medium text-gray-600">
                        {column.label}:
                      </span>
                      <span
                        className={`font-semibold ${
                          column.key === "status"
                            ? booking.isCancel
                              ? "text-red-800"
                              : booking.status
                              ? "text-green-800"
                              : "text-gray-800"
                            : "text-gray-900"
                        }`}
                      >
                        {displayValue}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No records found</p>
          )}
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6">
          {/* Mobile pagination controls (Previous/Next) */}
          <div className="flex-1 flex justify-between sm:hidden w-full mb-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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

          {/* Desktop pagination controls and info */}
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between w-full">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {filteredData.length > 0 ? indexOfFirstItem + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastItem, filteredData.length)}
                </span>{" "}
                of <span className="font-medium">{filteredData.length}</span>{" "}
                results
              </p>
            </div>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-700">
                Items per page:
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
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
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                {[...Array(totalPages).keys()].map((number) => {
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
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`relative inline-flex items-center px-2 py-2 border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages || totalPages === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
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
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      {/* Delete Modal using the dedicated component */}
      <DeleteModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => handleDeleteBooking(showDeleteConfirm)}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  );
};

export default TableView;
