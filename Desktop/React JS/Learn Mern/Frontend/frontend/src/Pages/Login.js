import React, { useState } from "react";
import "../css/forms.css";
import PopUp from "../Components/UI/PopUp";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const[popUp,setPopUp]=useState({show:false,msg:"",type:""});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const navigate=useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/knowvato/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.text(); // ya json() agar backend json return kare
      if(response.ok){

        setPopUp({show:true,msg:"Logged In...", type:"success" });
        navigate("/dashboard");
      } else {
        setPopUp({show:true,msg:"UserName or Password is wrong", type:"failed" });
      }

    } catch(error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          name="email" 
          placeholder="Enter Email"
          value={formData.email} 
          onChange={handleChange} 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Enter Password"
          value={formData.password} 
          onChange={handleChange} 
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
