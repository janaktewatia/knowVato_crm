import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "../../context/AuthContext";
import { Menu } from "lucide-react";
import BreadcrumbNav from "../../components/BreadcrumbNav";

const queryClient = new QueryClient();

const TITLES: Record<string, string> = {
  "/": "Home",
  "/modules/events": "Event Manager",
  "/modules/easy-inout": "Easy In-Out",
  "/modules/easy-inout/inout": "Easy In-Out - Mark Attendance",
  "/modules/easy-inout/bus": "Easy In-Out - Bus Attendance",
  "/modules/easy-inout/report": "Easy In-Out - Reports",
  "/modules/easy-inout/student": "Easy In-Out - Student Master",
  "/modules/easy-inout/setup": "Easy In-Out - Setup",
  "/modules/whatsapp": "WhatsApp CRM",
  "/modules/website": "Website Builder",
  "/modules/users": "User Management",
  "/modules/communication": "Communication",
  "/modules/front-office": "Front Office",
  "/modules/reports": "Reports & Analytics",
  "/modules/configuration": "Configuration",
};

function MainHeader() {
  const { user } = useAuth();
  const { toggleSidebar } = useSidebar();

  return (
    <div className="topbar flex items-center justify-between border-b bg-white px-3 sm:px-4 sticky top-0 z-10" style={{ height: "48px", borderColor: "var(--border)" }}>
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-100 md:hidden cursor-pointer flex-shrink-0"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <BreadcrumbNav />
      </div>
      <div className="flex items-center gap-3 text-xs text-slate-500 flex-shrink-0">
        <i className="bi bi-bell"></i>
        <span className="hidden sm:inline">{user?.email || "admin@knowvato.com"}</span>
      </div>
    </div>
  );
}

export default function MainLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="crm-theme app-shell min-h-screen flex w-full" style={{ background: "var(--page-bg)" }}>
          <AppSidebar />
          <div className="main flex-1 flex flex-col min-w-0 w-full">
            <MainHeader />
            <div className="content p-1 sm:p-2 flex-1 min-w-0 w-full overflow-x-hidden">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
