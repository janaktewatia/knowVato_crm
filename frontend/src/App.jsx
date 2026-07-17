import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Spinner } from "./components/ui";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Registration from "./pages/Registration";
import FollowUps from "./pages/FollowUps";
import Conversion from "./pages/Conversion";
import Contacts from "./pages/Contacts";
import Conversations from "./pages/Conversations";
import Campaigns from "./pages/Campaigns";
import MessageHistory from "./pages/MessageHistory";
import Templates from "./pages/Templates";
import Setup from "./pages/Setup";
import PublicEnquiryForm from "./pages/PublicEnquiryForm";
import PublicLandingPage from "./pages/PublicLandingPage";
import EnquiryForms from "./pages/EnquiryForms";
import Audit from "./pages/Audit";
import ClarwynEnquiryNow from "./pages/ClarwynEnquiryNow";

// Knowvato Main Components
import MainLayout from "./knowvato-main/routes/__root";
import KnowvatoDashboard from "./knowvato-main/routes/index";
import EventManagerLayout from "./knowvato-main/routes/modules.events";
import EventsIndex from "./knowvato-main/routes/modules.events.index";
import EventsCreate from "./knowvato-main/routes/modules.events.create";
import EventsRegistrants from "./knowvato-main/routes/modules.events.registrants";
import EventsScan from "./knowvato-main/routes/modules.events.scan";
import EventsQr from "./knowvato-main/routes/modules.events.qr";
import EventsBulkQr from "./knowvato-main/routes/modules.events.bulk-qr";
import TemplatesWhatsapp from "./knowvato-main/routes/modules.templates-whatsapp";
import TemplatesEmail from "./knowvato-main/routes/modules.templates-email";
import TemplatesSms from "./knowvato-main/routes/modules.templates-sms";
import IntegrationsWhatsapp from "./knowvato-main/routes/modules.integrations-whatsapp";
import ModulePage from "./knowvato-main/routes/modules.$module";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner label="Starting…" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <div className="crm-theme"><Login /></div>} />
      <Route path="/public/enquiry-form/:formId" element={<div className="crm-theme"><PublicEnquiryForm /></div>} />
      <Route path="/public/landing-page/:pageId" element={<div className="crm-theme"><PublicLandingPage /></div>} />
      <Route path="/clp/enquirenow" element={<div className="crm-theme"><ClarwynEnquiryNow /></div>} />

      {/* Knowvato Main Routes */}
      <Route
        path="/"
        element={
          <Protected>
            <MainLayout />
          </Protected>
        }
      >
        <Route index element={<KnowvatoDashboard />} />
        <Route path="modules/events" element={<EventManagerLayout />}>
          <Route index element={<EventsIndex />} />
          <Route path="create" element={<EventsCreate />} />
          <Route path="registrants" element={<EventsRegistrants />} />
          <Route path="scan" element={<EventsScan />} />
          <Route path="qr" element={<EventsQr />} />
          <Route path="bulk-qr" element={<EventsBulkQr />} />
        </Route>
        <Route path="modules/templates-whatsapp" element={<TemplatesWhatsapp />} />
        <Route path="modules/templates-email" element={<TemplatesEmail />} />
        <Route path="modules/templates-sms" element={<TemplatesSms />} />
        <Route path="modules/integrations-whatsapp" element={<IntegrationsWhatsapp />} />
        <Route path="modules/:module" element={<ModulePage />} />
      </Route>

      {/* WhatsApp CRM Routes */}
      <Route
        path="/crm"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/registration/:leadId" element={<Registration />} />
        <Route path="followups" element={<FollowUps />} />
        <Route path="conversion" element={<Conversion />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="chat" element={<Conversations />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="history" element={<MessageHistory />} />
        <Route path="templates" element={<Templates />} />
        <Route path="setup" element={<Setup />} />
        <Route path="setup/enquiry-forms" element={<EnquiryForms />} />
        <Route path="setup/enquiry-forms/:formId" element={<EnquiryForms />} />
        <Route path="audit" element={<Audit />} />
      </Route>

      {/* Fallback to main page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
