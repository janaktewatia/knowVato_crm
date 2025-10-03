import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Layouts
import PublicLayout from "./Components/Layout/PublicLayout";
import PrivateLayout from "./Components/Layout/PrivateLayout";

// Standalone
import Login from "./Pages/Login";

// Public Pages
import Home from "./Pages/Home";
import Solutions from "./Pages/Solutions";
import Clientele from "./Pages/Clientele";
import BookDemo from "./Pages/EnquiryForm";

// Private Pages
import ManagementDashboard from './Pages/ManagementDashboard';
import Leads from './Pages/Leads';
import LeadFollowUp from './Pages/LeadFollowUp';
import LeadDataPort from './Pages/LeadDataPort';
import LeadDataUpdate from './Pages/LeadDataUpdate';
import RegistrationDashboard from './Pages/RegistrationDashboard';
import Registrations from "./Pages/Registration";
import RegistrationFollowUp from "./Pages/RegistrationFollowUp";
import RegistrationDataPort from './Pages/RegistrationDataPort';
import RegistrationDataUpdate from './Pages/RegistrationDataUpdate';
import Payments from './Pages/Payments';
import CampusTourDashboard from "./Pages/CampusTourDashboard";
import CampusTour from './Pages/CampusTour';
import SendCommunication from './Pages/SendCommunication';
import CommunicationHistory from './Pages/CommunicationHistory';
import Reports from './Pages/Reports';

function App() {
  return (
    <Router>
      <Routes>

        {/* =======================
            PUBLIC ROUTES
        ======================== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/clientele" element={<Clientele />} />
          <Route path="/book-demo" element={<BookDemo />} />
        </Route>

        {/* =======================
            STANDALONE ROUTES
            Login page without Navbar/Sidebar
        ======================== */}
        <Route path="/login" element={<Login />} />

        {/* =======================
            PRIVATE ROUTES
            After login - Navbar + Sidebar fixed
        ======================== */}
        <Route element={<PrivateLayout />}>
          <Route path="/dashboard" element={<ManagementDashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/lead-follow-up" element={<LeadFollowUp />} />
          <Route path="/lead-data-port" element={<LeadDataPort />} />
          <Route path="/lead-data-update" element={<LeadDataUpdate />} />
          <Route path="/reg-dashboard" element={<RegistrationDashboard />} />
          <Route path="/registrations" element={<Registrations />} />
          <Route path="/reg-follow-up" element={<RegistrationFollowUp />} />
          <Route path="/reg-data-port" element={<RegistrationDataPort />} />
          <Route path="/reg-update" element={<RegistrationDataUpdate />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/campus-tour-dashboard" element={<CampusTourDashboard />} />
          <Route path="/campus-tour" element={<CampusTour />} />
          <Route path="/send-communication" element={<SendCommunication />} />
          <Route path="/communication-history" element={<CommunicationHistory />} />
          <Route path="/reports" element={<Reports />} />
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;
