// src/components/TableView.jsx
import React from "react";
import "./TableView.css";

const COLUMN_DEFS = [
  { key: "sr_no",            label: "Sr. No." },
  { key: "parking_name",     label: "Parking Name" },     // ← new column
  { key: "date_time",        label: "Date & Time" },
  { key: "name",             label: "Customer Name" },
  { key: "phone_no",         label: "Contact Number" },
  { key: "vehicle_type",     label: "Vehicle Type" },
  { key: "vehicle_number",   label: "Vehicle Number" },
  { key: "machine",          label: "Machine ID" },
  { key: "pallet_no",        label: "Pallet No." },
  { key: "booking_msg_sent", label: "Booking Msg Sent" },
  { key: "start_time",       label: "Booking Start Time" },
  { key: "end_time",         label: "Booking End Time" },
  { key: "duration",         label: "Duration (HH:MM)" },
  { key: "payment_method",     label: "Payment Mode" },
  { key: "amount",           label: "Amount Received (₹)" },
  { key: "barcode_generated",label: "Barcode Generated" },
  { key: "vehicle_released", label: "Vehicle Released" },
  { key: "operator_name",    label: "Operator Name" },
  { key: "token_no",         label: "Token No." },
];

const TableView = ({ data, title }) => {
  if (!data?.length) return null;

  // build each row, pulling parking_name in
  const rows = data.map((item, idx) => {
    // merge date/time
    const dateTime = item.start_date
      ? `${new Date(item.start_date.seconds * 1000).toLocaleDateString()} ${new Date(item.start_date.seconds * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`
      : "";

    // compute duration if needed
    const duration =
      item.start_time && item.end_time
        ? (() => {
            const start = item.start_time.seconds * 1000;
            const end = item.end_time.seconds * 1000;
            const diffMin = Math.round((end - start) / 60000);
            const hh = String(Math.floor(diffMin / 60)).padStart(2, "0");
            const mm = String(diffMin % 60).padStart(2, "0");
            return `${hh}:${mm}`;
          })()
        : item.duration ?? "";

    return {
      sr_no: idx + 1,
      parking_name: item.parking_name || "",          // ← ensure we include it
      date_time: dateTime,
      name: item.name || "",
      phone_no: item.phone_no || "",
      vehicle_type: item.vehicle_type || "",
      vehicle_number: item.vehicle_number || "",
      machine: item.machine || "",
      pallet_no: item.pallet_no || "",
      booking_msg_sent: item.booking_msg_sent ? "Y" : "N",
      start_time: item.start_time
        ? new Date(item.start_time.seconds * 1000).toLocaleString()
        : "",
      end_time: item.end_time
        ? new Date(item.end_time.seconds * 1000).toLocaleString()
        : "",
      duration,
      payment_method: item.payment_method || "",
      amount: item.amount ?? "",
      barcode_generated: item.barcode_generated ? "Y" : "N",
      vehicle_released: item.vehicle_released ? "Y" : "N",
      operator_name: item.operator_name || "",
      token_no: item.token_no?.toString() || "",
    };
  });

  return (
    <div className="table-container">
      <h2 className="table-title">{title}</h2>
      <table className="data-table">
        <thead>
          <tr>
            {COLUMN_DEFS.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {COLUMN_DEFS.map((col) => (
                <td key={col.key}>{row[col.key] ?? ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
