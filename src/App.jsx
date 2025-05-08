import React, { useEffect, useState } from "react";
import TableView from "./components/TableView";
import { fetchCollection } from "./firestoreService";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./App.css";

const App = () => {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [parkingNames, setParkingNames] = useState([]);
  const [selected, setSelected] = useState("All");

  useEffect(() => {
    const load = async () => {
      const data = await fetchCollection("bookings");
      setBookings(data);
      const names = Array.from(
        new Set(data.map((b) => b.parking_name).filter((n) => n))
      );
      setParkingNames(names);
      setFiltered(data);
    };
    load();
  }, []);

  useEffect(() => {
    if (selected === "All") {
      setFiltered(bookings);
    } else {
      setFiltered(bookings.filter((b) => b.parking_name === selected));
    }
  }, [selected, bookings]);

  // Export as CSV
  const exportCSV = () => {
    // Convert JSON to worksheet
    const ws = XLSX.utils.json_to_sheet(filtered);
    // Generate a CSV blob
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `bookings_${selected}.csv`);
  };

  // Export as XLSX
  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(filtered);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, `bookings_${selected}.xlsx`);
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>📋 Bookings by Parking</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={selected === "All" ? "active" : ""}
          onClick={() => setSelected("All")}
        >
          All
        </button>
        {parkingNames.map((name) => (
          <button
            key={name}
            className={selected === name ? "active" : ""}
            onClick={() => setSelected(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Export Buttons */}
      <div style={{ margin: "20px 0" }}>
        <button onClick={exportCSV} style={{ marginRight: 8 }}>
          Export CSV
        </button>
        <button onClick={exportXLSX}>
          Export Excel
        </button>
      </div>

      {/* Filtered Table */}
      <TableView
        data={filtered}
        title={selected === "All" ? "All Bookings" : `Bookings – ${selected}`}
      />
    </div>
  );
};

export default App;
