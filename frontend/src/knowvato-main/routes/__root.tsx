import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export default function MainLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-14 flex items-center gap-3 border-b bg-card/50 backdrop-blur px-4 sticky top-0 z-10">
              <SidebarTrigger />
              <div className="text-sm text-muted-foreground">KnowVato Solutions Workspace</div>
            </header>
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
