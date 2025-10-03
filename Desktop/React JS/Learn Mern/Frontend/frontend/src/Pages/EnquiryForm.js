import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/forms.css";
import image from '../assets/landing page 12.png';
import { getFadeInStyle } from "../Components/getFadeInStyle";
import PopUp from "../Components/UI/PopUp";
import { useNavigate } from "react-router-dom";
import { EnquiryFormValidation } from "../Validations/EnquiryFormValidation";




export default function EnquiryForm() {
  const [showDiv, setShowDiv] = useState(false);
  const[popUp,setPopUp]=useState({show:false,msg:"",type:""});
  const [errors,setErrors] = useState({});
const [validation,setValidation] = useState(true);


// // EnquiryForm fields validation
//   const validateField = (field) => {
//   const result = EnquiryFormValidation.pick({ [field]: true }).safeParse({ [field]: formData[field] });

//   if (!result.success) {
//     setErrors(prev => ({ 
//       ...prev, 
//       [field]: result.error.errors?.[0]?.message || "Invalid value" }));
//   } else {
//     setErrors(prev => ({ ...prev, [field]: "" }));
//   }
// };


const validateUsername = () => {
  const result = EnquiryFormValidation.pick({ username: true }).safeParse({ username: formData.username.trim() }); // parse the value

  if (!result.success) {
    setValidation(false);
    setErrors(prev => ({ ...prev, username: "Enter atleast 3 characters" }));

  } else {
        setValidation(true);
    setErrors({ username: "" });
  }
};

 //Initial form values 
const [formData, setFormData] = useState({
username:"",
email:"",
phone_no:"",
password:""
}
);

// Navigator object to navigate the page after some action
const navigate=useNavigate();


  useEffect(() => {
    const timer = setTimeout(() => setShowDiv(true), 50);
    return () => clearTimeout(timer);
  }, []);

// assigning values to useState through onChange event
const handleChange = (e) => {
  const { name, value } = e.target; 

  setFormData({
    ...formData,      // purana data as it is rakho
    [name]: value     // sirf jis field me change hua hai uska value update karo
  });
};


const handleClosePopup= ()=>{
    setPopUp({ ...popUp, show: false });
};


const handleSubmit = async (e)=>{
e.preventDefault();

if(!validation){
console.log("validation failed");
  return;

}

try{
  const response = await fetch("http://localhost:5000/knowvato/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

if(response.ok){
 setPopUp({show:true,msg:"User Registered...", type:"success" });
 reset();
  navigate("/login");
}
else{

   setPopUp({show:true,msg:"Something Went Wrong", type:"failed"});
 
}

}catch(error){
console.error("API Error:", error);
}
}

const reset = () => {
  setFormData({
    username: "",
    email: "",
    phone_no: "",
    password: ""
  });
};




  return (

<>

<div className="container d-flex align-items-center justify-content-center" >

  {popUp.show && <PopUp msg={popUp.msg} type={popUp.type} onClose={handleClosePopup} />}
</div>
    



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
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" name="username" value={formData.username} placeholder="Enter your name" onChange={handleChange} onBlur={validateUsername} />
          {errors.username && <p style={{ color: "red" }}>{errors.username}</p>}
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name="email" value={formData.email} placeholder="Enter your email" onChange={handleChange}  />
          {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
          </div>
          <div className="mb-3">
            <label className="form-label">Mobile Number</label>
            <input type="tel" className="form-control" name="phone_no" value={formData.phone_no} placeholder="Enter your mobile number" onChange={handleChange} />
          {errors.phone_no && <p style={{ color: "red" }}>{errors.phone_no}</p>}
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" name="password" value={formData.password} placeholder="Create Password" onChange={handleChange} />
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
    </>
  );
}
