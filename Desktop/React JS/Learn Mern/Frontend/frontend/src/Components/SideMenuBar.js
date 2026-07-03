import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import SideBarMenuData from "./SideBarMenuData";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../css/sidemenubar.css"; // <-- Import here

const SideMenuBar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const location = useLocation();

  const handleMenuClick = (index) => {
    setOpenMenu(openMenu === index ? null : index);
  };

  return (
    <aside className="sidebar-container m-1">
      <nav className="nav flex-column">
        {SideBarMenuData.map((menu, index) => (
          <div key={index} className="mb-1">
            {/* ===== Main Menu ===== */}
            {menu.subMenu ? (
              <div
                className="nav-link"
                onClick={() => handleMenuClick(index)}
              >
                <i className={`${menu.icon} fs-5`}></i>
                <span className="ms-3">{menu.title}</span>
                <i
                  className={`bi ms-auto bi-chevron-down chevron ${
                    openMenu === index ? "rotate" : ""
                  }`}
                  style={{ fontSize: "0.8rem" }}
                ></i>
              </div>
            ) : (
              <Link to={menu.path} className="nav-link">
                <i className={`${menu.icon} fs-6`}></i>
                <span className="ms-3">{menu.title}</span>
              </Link>
            )}

            {/* ===== Submenu ===== */}
            {menu.subMenu && (
              <div
                className="submenu-container"
                style={{
                  maxHeight: openMenu === index ? "500px" : "0",
                }}
              >
                {menu.subMenu.map((sub, subIndex) => {
                  const isActive = location.pathname === sub.path;
                  return (
                    <Link
                      key={subIndex}
                      to={sub.path}
                      className={`submenu-link ${
                        isActive ? "active-submenu" : ""
                      }`}
                    >
                      {sub.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SideMenuBar;
