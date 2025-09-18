import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/forms.css"; // Custom styling
import image from '../assets/landing page 12.png';
import { getFadeInStyle } from "./getFadeInStyle";

export default function EnquiryForm() {
  return (
    <div className="reg-container" >
      {/* Left side: Photo */}
      <div className="reg-left" style={{...getFadeInStyle(true,0,0,0,-20,-20,-20)}}>
        {/* Replace src with your image if needed */}
        <img
          src={image}
          alt="Side visual"
          className="img-fluid reg-photo"
        />
      </div>

      {/* Right side: Form */}
      <div className="reg-form-container " style={{...getFadeInStyle(true,0,0,0,20,20,20)}}>
        <h2 className="mb-4">Register</h2>
        <form>
          <div className="mb-3 " >
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
          <button type="submit" className="btn w-100 my-3 p-1" style={{backgroundColor:"#497dadff"}}>Register</button>
        </form>
      </div>
    </div>
  );
}
