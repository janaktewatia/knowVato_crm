// src/components/forms/EventForm.jsx
import React, { useState, useEffect } from "react";
import { useQR } from "../../context/QRContext";

const EventForm = () => {
  const { qrData, updateQRData } = useQR();
  const [summary, setSummary] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const val = qrData.value || "";
    if (val.startsWith("BEGIN:VEVENT")) {
      const lines = val.split("\n");
      lines.forEach((line) => {
        if (line.startsWith("SUMMARY:")) setSummary(line.substring(8));
        if (line.startsWith("DTSTART:")) setStartDate(line.substring(8));
        if (line.startsWith("DTEND:")) setEndDate(line.substring(6));
        if (line.startsWith("LOCATION:")) setLocation(line.substring(9));
        if (line.startsWith("DESCRIPTION:")) setDescription(line.substring(12));
      });
    }
  }, [qrData.value]);

  const generateEvent = () => {
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n";
    if (summary) ics += `SUMMARY:${summary}\n`;
    if (startDate)
      ics += `DTSTART:${startDate.replace(/-/g, "").replace(/:/g, "")}\n`;
    if (endDate)
      ics += `DTEND:${endDate.replace(/-/g, "").replace(/:/g, "")}\n`;
    if (location) ics += `LOCATION:${location}\n`;
    if (description) ics += `DESCRIPTION:${description}\n`;
    ics += "END:VEVENT\nEND:VCALENDAR";
    updateQRData({ value: ics });
  };

  useEffect(() => {
    if (summary) generateEvent();
  }, [summary, startDate, endDate, location, description]);

  return (
    <div className="event-form">
      <label className="form-label fw-bold">Event Name</label>
      <input
        className="form-control mb-2"
        placeholder="Conference 2025"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
      <label className="form-label fw-bold mt-2">Start Date & Time</label>
      <input
        type="datetime-local"
        className="form-control mb-2"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <label className="form-label fw-bold mt-2">End Date & Time</label>
      <input
        type="datetime-local"
        className="form-control mb-2"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <label className="form-label fw-bold mt-2">Location</label>
      <input
        className="form-control mb-2"
        placeholder="Venue address"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <label className="form-label fw-bold mt-2">Description</label>
      <textarea
        className="form-control"
        rows="2"
        placeholder="Event details..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <small className="text-muted">
        Adds event to calendar (iCal format).
      </small>
    </div>
  );
};

export default EventForm;
