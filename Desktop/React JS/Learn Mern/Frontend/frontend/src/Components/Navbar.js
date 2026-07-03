import "../css/navbar.css"; // Optional for extra styles
import EnquiryForm from "../Pages/EnquiryForm"
import { useState } from "react";
import "../App.css"
import knowvato_Logo from "../assets/Knowvato_logo.png"

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
          <img src={knowvato_Logo} alt="Home" className="me-2" style={{ height: '30px', width:"30px" }} />
          <span className="text-white fw-bold">Knowvato</span>
        </div>

        {/* Center: navigation links */}
        <ul className="d-flex list-unstyled mx-auto mb-0">
          <li className="mx-3"><a href="/solutions" className="text-white text-decoration-none">Solution</a></li>
          <li className="mx-3"><a href="clientele" className="text-white text-decoration-none">Clientele</a></li>
          <li className="mx-3"><a href="about" className="text-white text-decoration-none">About Us</a></li>
          <li className="mx-3"><a href="contact" className="text-white text-decoration-none">Contact Us</a></li>
        </ul>

        {/* Right side: Book Demo button */}
        <button className="btn themeColor_Buttons" onClick={bookDemo}>
          Register Now
        </button>
      </div>
    </nav>
     {showform && <EnquiryForm />}
     </>
  );
}
