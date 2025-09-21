import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/forms.css";
import image from '../assets/landing page 12.png';
import { getFadeInStyle } from "./getFadeInStyle";

export default function EnquiryForm() {
  const [showDiv, setShowDiv] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowDiv(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="reg-container">
      {/* Left side: Photo */}
      <div
        className="reg-left"
        style={{ ...getFadeInStyle(showDiv, 0, 0, 0, -20, -20, 0) }}
      >
        <img src={image} alt="Side visual" className="img-fluid reg-photo" />
      </div>

      {/* Right side: Form */}
      <div
        className="reg-form-container"
        style={{ ...getFadeInStyle(showDiv, 0, 0, 0, 20, 20, 0) }}
      >
        <h2 className="mb-4">Register</h2>
        <form>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" placeholder="Enter your name" />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" placeholder="Enter your email" />
          </div>
          <div className="mb-3">
            <label className="form-label">Mobile Number</label>
            <input type="tel" className="form-control" placeholder="Enter your mobile number" />
          </div>
          <button
            type="submit"
            className="btn w-100 my-3 p-1 themeColor_Buttons"
            
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
