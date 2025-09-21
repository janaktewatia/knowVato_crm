import React from "react";
import SideMenuBar from "./SideMenuBar";

function Admin() {
  return (
    <div className="d-flex">
      {/* Sidebar */}
      <SideMenuBar />

      {/* Main Content */}
      <main className="flex-fill p-4">
        <h1>Main Content Area</h1>
        <p>Yahan aapka page ka main content aayega.</p>
      </main>
    </div>
  );
}

export default Admin;
