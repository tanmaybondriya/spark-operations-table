// components/FilterBar.jsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const FilterBar = ({
  dateRange,
  setDateRange,
  selectedParking,
  setSelectedParking,
  parkingOptions,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <div className="flex items-center gap-2">
            <DatePicker
              selected={dateRange.start}
              onChange={(date) => setDateRange({ ...dateRange, start: date })}
              selectsStart
              startDate={dateRange.start}
              endDate={dateRange.end}
              placeholderText="Start Date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-gray-500">to</span>
            <DatePicker
              selected={dateRange.end}
              onChange={(date) => setDateRange({ ...dateRange, end: date })}
              selectsEnd
              startDate={dateRange.start}
              endDate={dateRange.end}
              minDate={dateRange.start}
              placeholderText="End Date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Parking Location
          </label>
          <select
            value={selectedParking}
            onChange={(e) => setSelectedParking(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {parkingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setDateRange({ start: null, end: null });
              setSelectedParking("All");
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
