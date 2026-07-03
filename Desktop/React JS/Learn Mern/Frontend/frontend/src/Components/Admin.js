// src/Components/Admin.js
import React from "react";
import SideMenuBar from "./SideMenuBar";

const Admin = () => {
  return (
    <div
      style={{
        width: "250px",
        backgroundColor: "#ffffffff",
        color: "white",
        minHeight: "100vh",
        padding: "10px",
        position: "sticky",
        top: 0,
      }}
    >
      <SideMenuBar />
    </div>
  );
};

export default Admin;
