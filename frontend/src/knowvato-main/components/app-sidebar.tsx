import { Link, useLocation } from "react-router-dom";
import {
  CalendarRange,
  MessageSquare,
  Globe2,
  Users,
  Megaphone,
  Building2,
  BarChart3,
  Settings,
  LogIn,
  LogOut,
  LayoutDashboard,
  Bookmark,
  ChevronRight,
  Home,
  CalendarPlus,
  ScanLine,
  QrCode,
  Layers,
  UserCheck,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useAuth } from "../../context/AuthContext";
import { useBookmarks } from "@/lib/bookmarks";

const modules = [
  { title: "Event Manager", slug: "events", icon: CalendarRange },
  { title: "WhatsApp CRM", slug: "whatsapp", icon: MessageSquare },
  { title: "Website Builder", slug: "website", icon: Globe2 },
  { title: "Communication", slug: "communication", icon: Megaphone },
  { title: "Front Office", slug: "front-office", icon: Building2 },
  { title: "Reports & Analytics", slug: "reports", icon: BarChart3 },
  { title: "User Management", slug: "users", icon: Users },
];

const configurationSubmenu = [
  { title: "WhatsApp Template", slug: "templates-whatsapp" },
  { title: "SMS Template", slug: "templates-sms" },
  { title: "Email Template", slug: "templates-email" },
  { title: "WhatsApp Integration", slug: "integrations-whatsapp" },
  { title: "Email Integration", slug: "integrations-email" },
  { title: "SMS Integration", slug: "integrations-sms" },
  { title: "Facebook Integration", slug: "integrations-facebook" },
  { title: "Other API Integration", slug: "integrations-other" },
];

const eventsSubmenu = [
  { title: "Dashboard", path: "/modules/events", icon: LayoutDashboard, exact: true },
  { title: "Create Event", path: "/modules/events/create", icon: CalendarPlus },
  { title: "Registrants", path: "/modules/events/registrants", icon: UserCheck },
  { title: "Scan Pass", path: "/modules/events/scan", icon: ScanLine },
  { title: "Generate QR Code", path: "/modules/events/qr", icon: QrCode },
  { title: "Bulk QR Code", path: "/modules/events/bulk-qr", icon: Layers },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const pathname = location.pathname;
  const { user, logout } = useAuth();
  const { bookmarks } = useBookmarks();
  const isConfigurationPath =
    pathname.startsWith("/modules/integrations-") ||
    pathname.startsWith("/modules/templates-") ||
    pathname === "/modules/configuration";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold">
            O
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">KnowVato Solutions</span>
              <span className="text-xs text-muted-foreground">Workspace</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {pathname.startsWith("/modules/events") ? (
          <SidebarGroup>
            <SidebarGroupLabel>Event Manager</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Home">
                    <Link to="/" className="flex items-center gap-2">
                      <Home className="h-4 w-4 shrink-0" />
                      <span>Home</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {eventsSubmenu.map((s) => {
                  const active = s.exact ? pathname === s.path : pathname === s.path;
                  return (
                    <SidebarMenuItem key={s.path}>
                      <SidebarMenuButton asChild isActive={active} tooltip={s.title}>
                        <Link to={s.path} className="flex items-center gap-2">
                          <s.icon className="h-4 w-4 shrink-0" />
                          <span>{s.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === "/"} tooltip="Dashboard">
                      <Link to="/" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Modules</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {modules.map((m) => {
                    const url = m.slug === "whatsapp" ? "/crm" : m.slug === "events" ? "/modules/events" : `/modules/${m.slug}`;
                    const active = pathname === url || (m.slug === "whatsapp" && pathname.startsWith("/crm"));
                    return (
                      <SidebarMenuItem key={m.slug}>
                        <SidebarMenuButton asChild isActive={active} tooltip={m.title}>
                          <Link to={url} className="flex items-center gap-2">
                            <m.icon className="h-4 w-4 shrink-0" />
                            <span>{m.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}

                  <Collapsible
                    open={isConfigurationPath}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild tooltip="Configuration" isActive={isConfigurationPath}>
                        <Link
                          to="/modules/configuration"
                          className="flex items-center gap-2"
                        >
                          <Settings className="h-4 w-4 shrink-0" />
                          <span>Configuration</span>
                          <ChevronRight
                            className={`ml-auto h-4 w-4 transition-transform ${isConfigurationPath ? "rotate-90" : ""}`}
                          />
                        </Link>
                      </SidebarMenuButton>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild isActive={pathname === "/modules/configuration"}>
                              <Link to="/modules/configuration">
                                <span>General</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          {configurationSubmenu.map((s) => {
                            const url = `/modules/${s.slug}`;
                            return (
                              <SidebarMenuSubItem key={s.slug}>
                                <SidebarMenuSubButton asChild isActive={pathname === url}>
                                  <Link to={`/modules/${s.slug}`}>
                                    <span>{s.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {bookmarks.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Bookmarks</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {bookmarks.map((b) => {
                      const slug = b.url.replace("/modules/", "");
                      return (
                        <SidebarMenuItem key={b.url}>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname === b.url}
                            tooltip={b.title}
                          >
                            <Link
                              to={`/modules/${slug}`}
                              className="flex items-center gap-2"
                            >
                              <Bookmark className="h-4 w-4 shrink-0" />
                              <span>{b.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          {user ? (
            <>
              <SidebarMenuItem>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {!collapsed && (
                    <div className="flex flex-col leading-tight overflow-hidden">
                      <span className="text-sm font-medium truncate">{user.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </div>
                  )}
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip="Log out">
                  <LogOut className="h-4 w-4" />
                  <span>Log out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Log in"
              >
                <Link to="/login">
                  <LogIn className="h-4 w-4" />
                  <span>Log in</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
