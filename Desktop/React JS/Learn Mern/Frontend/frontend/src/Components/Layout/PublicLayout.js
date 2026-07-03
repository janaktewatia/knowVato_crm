import { Outlet } from "react-router-dom";
import Navbar from "../Navbar";

const PublicLayout = () => {
  return (
    <>
      {/* Public pages ke liye sirf Navbar dikhna chahiye */}
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Outlet /> {/* Outlet ke andar public pages load honge */}
      </div>
    </>
  );
};

export default PublicLayout;
