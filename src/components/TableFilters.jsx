// components/TableFilters.jsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TableFilters = ({
  filters,
  setFilters,
  resetFilters,
  parkingOptions,
  vehicleTypeOptions,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 overflow-x-auto">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-700">Filters</h2>
        <button
          onClick={resetFilters}
          className="text-sm sm:text-base text-blue-600 hover:text-blue-800"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <DatePicker
            selected={filters.dateRange.start}
            onChange={(date) =>
              setFilters((prev) => ({
                ...prev,
                dateRange: { ...prev.dateRange, start: date },
              }))
            }
            selectsStart
            startDate={filters.dateRange.start}
            endDate={filters.dateRange.end}
            placeholderText="Start Date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <DatePicker
            selected={filters.dateRange.end}
            onChange={(date) =>
              setFilters((prev) => ({
                ...prev,
                dateRange: { ...prev.dateRange, end: date },
              }))
            }
            selectsEnd
            startDate={filters.dateRange.start}
            endDate={filters.dateRange.end}
            minDate={filters.dateRange.start}
            placeholderText="End Date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parking Location
          </label>
          <select
            value={filters.parkingName}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                parkingName: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {parkingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle Type
          </label>
          <select
            value={filters.vehicleType}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                vehicleType: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {vehicleTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, vehicle number or token..."
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                searchTerm: e.target.value,
              }))
            }
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default TableFilters;
