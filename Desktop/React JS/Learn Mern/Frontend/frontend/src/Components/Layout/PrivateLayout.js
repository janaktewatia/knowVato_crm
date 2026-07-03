import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";
import Admin from "../Admin";

const PrivateLayout = () => {
  return (
    <>
      {/* Private pages ke liye Navbar + Sidebar dono fixed */}
      <Navbar />
      <div style={{ display: "flex", backgroundColor:"#f5f5f5ff" }}>
        {/* Sidebar */}
        <Admin />

        {/* Main Dynamic Area */}
        <div style={{ flex: 1, padding: "20px" }}>
          <Outlet /> {/* Outlet ke andar private pages load honge */}
        </div>
      </div>
    </>
  );
};

export default PrivateLayout;
