import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Websites from "./pages/Websites";
import TemplateLibrary from "./pages/TemplateLibrary";
import Chatbot from "./pages/Chatbot";
import Pages from "./pages/Pages";
import PageBuilder from "./pages/PageBuilder";
import MediaLibrary from "./pages/MediaLibrary";
import Forms from "./pages/Forms";
import FormBuilder from "./pages/FormBuilder";
import FormResponses from "./pages/FormResponses";
import News from "./pages/News";
import Events from "./pages/Events";
import Themes from "./pages/Themes";
import SEO from "./pages/SEO";
import Menus from "./pages/Menus";
import Banners from "./pages/Banners";
import Popups from "./pages/Popups";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Backup from "./pages/Backup";
import EmployeeTypes from "./pages/EmployeeTypes";
import Users from "./pages/Users";
import PublicSite from "./public-site/PublicSite";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-5 text-center"><span className="spinner-border" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

// Guards a route by module view-permission. Falls back to dashboard if not allowed.
function Guard({ module, children }) {
  const { can } = useAuth();
  return can(module, "view") ? children : <NoAccess />;
}
function NoAccess() {
  return (
    <div className="text-center text-muted py-5">
      <i className="bi bi-lock d-block mb-3" style={{ fontSize: "3rem", opacity: .4 }} />
      <h5>No access</h5>
      <p className="small">You don't have permission to view this module.</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/site/:slug" element={<PublicSite />} />
      <Route path="/site/:slug/page/:pageSlug" element={<PublicSite />} />
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><AppLayout /></Protected>}>
        <Route path="/" element={<Guard module="dashboard"><Dashboard /></Guard>} />
        <Route path="/websites" element={<Guard module="websites"><Websites /></Guard>} />
        <Route path="/templates" element={<Guard module="templates"><TemplateLibrary /></Guard>} />
        <Route path="/chatbot" element={<Guard module="chatbot"><Chatbot /></Guard>} />
        <Route path="/websites/:websiteId/pages" element={<Guard module="pages"><Pages /></Guard>} />
        <Route path="/websites/:websiteId/pages/:pageId/build" element={<Guard module="pages"><PageBuilder /></Guard>} />
        <Route path="/media" element={<Guard module="media"><MediaLibrary /></Guard>} />
        <Route path="/forms" element={<Guard module="forms"><Forms /></Guard>} />
        <Route path="/forms/:id/build" element={<Guard module="forms"><FormBuilder /></Guard>} />
        <Route path="/forms/:id/responses" element={<Guard module="forms"><FormResponses /></Guard>} />
        <Route path="/news" element={<Guard module="news"><News /></Guard>} />
        <Route path="/events" element={<Guard module="events"><Events /></Guard>} />
        <Route path="/themes" element={<Guard module="themes"><Themes /></Guard>} />
        <Route path="/seo" element={<Guard module="seo"><SEO /></Guard>} />
        <Route path="/menus" element={<Guard module="menus"><Menus /></Guard>} />
        <Route path="/banners" element={<Guard module="banners"><Banners /></Guard>} />
        <Route path="/popups" element={<Guard module="popups"><Popups /></Guard>} />
        <Route path="/analytics" element={<Guard module="analytics"><Analytics /></Guard>} />
        <Route path="/settings" element={<Guard module="settings"><Settings /></Guard>} />
        <Route path="/backup" element={<Guard module="backup"><Backup /></Guard>} />
        <Route path="/employee-types" element={<Guard module="employeeTypes"><EmployeeTypes /></Guard>} />
        <Route path="/users" element={<Guard module="users"><Users /></Guard>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
