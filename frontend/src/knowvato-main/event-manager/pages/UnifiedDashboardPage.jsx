import React from "react";
import { useNavigate } from "../lib/router-shim";
import { useEventData } from "../context/EventDataContext";

const UnifiedDashboardPage = () => {
  const navigate = useNavigate();
  const { events, attendees } = useEventData();

  const modules = [
    {
      id: "qr-generator",
      icon: "bi-qr-code-scan",
      label: "QR Code Generator",
      description: "Generate and customize QR codes",
      color: "var(--chart-5)",
      path: "/",
      permission: "pass.generate",
    },
    {
      id: "events",
      icon: "bi-calendar-event",
      label: "Event Manager",
      description: "Create and manage events",
      color: "var(--chart-2)",
      path: "/events",
      permission: "events.view",
    },
    {
      id: "registrants",
      icon: "bi-people-fill",
      label: "Registrants",
      description: "Manage event registrations",
      color: "var(--chart-3)",
      path: "/registrants",
      permission: "attendees.view",
    },
    {
      id: "scan",
      icon: "bi-binoculars",
      label: "Scan Pass",
      description: "Scan and track attendance",
      color: "var(--chart-4)",
      path: "/scan",
      permission: "scan.access",
    },
    {
      id: "analytics",
      icon: "bi-bar-chart-fill",
      label: "Reports & Analytics",
      description: "View detailed reports",
      color: "var(--destructive)",
      path: "/analytics",
      permission: "reports.dashboard",
    },
    {
      id: "setup",
      icon: "bi-gear-fill",
      label: "Setup",
      description: "Configure system settings",
      color: "var(--chart-2)",
      path: "/setup",
      permission: "setup.access",
    },
  ];

  const stats = [
    {
      icon: "bi-calendar-event",
      label: "Total Events",
      value: events.length,
      trend: "+12.5%",
      color: "var(--primary)",
    },
    {
      icon: "bi-people-fill",
      label: "Total Registrants",
      value: attendees.length,
      trend: "+8.2%",
      color: "var(--chart-2)",
    },
    {
      icon: "bi-person-check-fill",
      label: "Checked-in",
      value: attendees.filter((a) => a.status && a.status !== "registered").length,
      trend: "+5.1%",
      color: "var(--success)",
    },
    {
      icon: "bi-percent",
      label: "Attendance Rate",
      value: attendees.length > 0 ? `${Math.round((attendees.filter((a) => a.status && a.status !== "registered").length / attendees.length) * 100)}%` : "0%",
      trend: "+2.3%",
      color: "var(--chart-4)",
    },
  ];

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh", padding: "2rem" }}>
      {/* Header */}
      <div className="mb-5">
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "var(--foreground)", marginBottom: 8 }}>
          Welcome back 👋
        </h1>
        <p style={{ fontSize: 15, color: "var(--muted-foreground)", margin: 0 }}>
          Here's what's happening across your workspace today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-12 col-sm-6 col-lg-3">
            <div
              className="card border"
              style={{
                borderRadius: "var(--radius)",
                background: "var(--card)",
                color: "var(--card-foreground)",
                borderColor: "var(--border)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                overflow: "hidden",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div className="card-body p-4">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius)",
                    background: `color-mix(in oklch, ${stat.color} 15%, transparent)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <i
                    className={`bi ${stat.icon}`}
                    style={{ fontSize: 20, color: stat.color }}
                  />
                </div>
                <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0, marginBottom: 8 }}>
                  {stat.label}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "var(--foreground)",
                      margin: 0,
                    }}
                  >
                    {stat.value}
                  </h3>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--success)",
                    }}
                  >
                    {stat.trend}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modules Section */}
      <div>
        <h2
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "var(--foreground)",
            marginBottom: 20,
          }}
        >
          Modules
        </h2>
        <div className="row g-3">
          {modules.map((module) => (
            <div key={module.id} className="col-12 col-sm-6 col-lg-4">
              <div
                onClick={() => navigate(module.path)}
                style={{
                  borderRadius: "var(--radius)",
                  background: "var(--card)",
                  color: "var(--card-foreground)",
                  padding: "1.5rem",
                  cursor: "pointer",
                  border: "2px solid transparent",
                  transition: "all 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.1)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = module.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "transparent";
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius)",
                    background: `color-mix(in oklch, ${module.color} 15%, transparent)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <i
                    className={`bi ${module.icon}`}
                    style={{
                      fontSize: 24,
                      color: module.color,
                    }}
                  />
                </div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "var(--foreground)",
                    margin: "0 0 8px 0",
                  }}
                >
                  {module.label}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--muted-foreground)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {module.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboardPage;
