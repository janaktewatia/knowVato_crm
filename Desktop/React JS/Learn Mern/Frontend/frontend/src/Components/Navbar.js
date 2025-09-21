import "../css/navbar.css"; // Optional for extra styles
import EnquiryForm from "./EnquiryForm.js";
import { useState } from "react";
import "../App.css"

export default function Navbar() {

const [showform, setShowform] = useState(false);


const bookDemo=()=>{
setShowform(true)
}

  return (
    <>
    <nav className="navbar px-3 themeColor_Menu">
      <div className="d-flex align-items-center justify-content-center  w-100">
        
        {/* Left side: logo and name */}
        <div className="d-flex align-items-center  ">
          <img src="" alt="Logo" className="me-2" style={{ height: '40px' }} />
          <span className="text-white fw-bold">LogoName</span>
        </div>

        {/* Center: navigation links */}
        <ul className="d-flex list-unstyled mx-auto mb-0">
          <li className="mx-3"><a href="solution" className="text-white text-decoration-none">Solution</a></li>
          <li className="mx-3"><a href="clientele" className="text-white text-decoration-none">Clientele</a></li>
          <li className="mx-3"><a href="about" className="text-white text-decoration-none">About Us</a></li>
          <li className="mx-3"><a href="contact" className="text-white text-decoration-none">Contact Us</a></li>
        </ul>

        {/* Right side: Book Demo button */}
        <button className="btn themeColor_Buttons" onClick={bookDemo}>
          Book Demo
        </button>
      </div>
    </nav>
     {showform && <EnquiryForm />}
     </>
  );
}
