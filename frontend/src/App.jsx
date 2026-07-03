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
import EnquiryForms from "./pages/EnquiryForms";
import Audit from "./pages/Audit";

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
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/public/enquiry-form/:formId" element={<PublicEnquiryForm />} />
      <Route
        path="/"
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
