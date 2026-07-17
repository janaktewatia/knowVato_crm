// src/components/forms/LocationForm.jsx
import React, { useState, useEffect } from "react";
import { useQR } from "../../context/QRContext";

const LocationForm = () => {
  const { qrData, updateQRData } = useQR();
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const val = qrData.value || "";
    if (val.includes("geo:")) {
      const coords = val.substring(4).split("?")[0].split(",");
      if (coords.length === 2) {
        setLat(coords[0]);
        setLng(coords[1]);
      }
    } else if (val.includes("maps.google.com")) {
      // optionally parse
    }
  }, [qrData.value]);

  const updateLocation = () => {
    if (lat && lng) {
      updateQRData({ value: `geo:${lat},${lng}` });
    } else if (query) {
      updateQRData({
        value: `https://maps.google.com/?q=${encodeURIComponent(query)}`,
      });
    }
  };

  useEffect(() => {
    updateLocation();
  }, [lat, lng, query]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude.toString());
        setLng(pos.coords.longitude.toString());
        setQuery("");
      });
    } else {
      alert("Geolocation not supported");
    }
  };

  return (
    <div className="location-form">
      <div className="mb-3">
        <button
          className="btn btn-outline-secondary w-100"
          onClick={getCurrentLocation}
        >
          📍 Use My Current Location
        </button>
      </div>
      <label className="form-label fw-bold">Or enter coordinates</label>
      <div className="row">
        <div className="col-6">
          <input
            className="form-control"
            placeholder="Latitude"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
        </div>
        <div className="col-6">
          <input
            className="form-control"
            placeholder="Longitude"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
          />
        </div>
      </div>
      <div className="text-center my-2">— OR —</div>
      <label className="form-label fw-bold">Search place name</label>
      <input
        className="form-control"
        placeholder="Eiffel Tower, Paris"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <small className="text-muted mt-2">
        QR opens Google Maps with location.
      </small>
    </div>
  );
};

export default LocationForm;
