const SideBarMenuData = [
  {
    title: " Management Dashboard",
    icon: "bi bi-speedometer2",
    path: "/dashboard",
  },
  {
    title: "Lead Manager",
    icon: "bi bi-person-lines-fill",
    subMenu: [
      { title: "Leads", path: "/leads" },
      { title: "Follow Up", path: "/lead-follow-up" },
      { title: "Data Port", path: "/lead-data-port" },
      { title: "Bulk Update", path: "/lead-data-update" },
    ],
  },
  {
    title: "Registration Manager",
    icon: "bi bi-card-checklist",
    subMenu: [
      { title: "Dashboard", path: "/reg-dashboard" },
      { title: "Registrations", path: "/registrations" },
      { title: "Follow Up", path: "/reg-follow-up" },
      { title: "Data Port", path: "/reg-data-port" },
      { title: "Update", path: "/reg-update" },
      { title: "Payments", path: "/reg-payments" },

    ],
  },
  {
    title: "Campus Tour Manager",
    icon: "bi bi-building",
    subMenu: [
        { title: "Dashboard", path: "/campus-tour-dashboard" },
      { title: "Campus Tour", path: "/campus-tour" },
  
    ]
   },
  {
    title: "Communications",
    icon: "bi bi-upload",
    subMenu: [
      { title: "Send Communication", path: "/send-communication" },
      { title: "History", path: "/communication-history" },
    ],
  },
  {
    title: "Reports",
    icon: "bi bi-upload",
    subMenu: [
      { title: "Reports", path: "/reports" },
      { title: "Insights", path: "/insights" },
    ],
  },

  {
    title: "Setup",
    icon: "bi bi-gear",
    path: "/setup",
  },
];

export default SideBarMenuData;
