import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from './Components/Navbar';
import Admin from './Components/Admin';

import ManagementDashboard from './Pages/ManagementDashboard';

// Lead Manager
import Leads from './Pages/Leads';
import LeadFollowUp from './Pages/LeadFollowUp';
import LeadDataPort from './Pages/LeadDataPort';
import LeadDataUpdate from './Pages/LeadDataUpdate';

// Registration Manager
import RegistrationDashboard from './Pages/RegistrationDashboard';
import Registrations from "./Pages/Registration";
import RegistrationFollowUp from "./Pages/RegistrationFollowUp"
import RegistrationDataPort from './Pages/RegistrationDataPort';
import RegistrationDataUpdate from './Pages/RegistrationDataUpdate';
import Payments from './Pages/Payments';

// School Tour
import CampusTourDashboard from "./Pages/CampusTourDashboard";
import CampusTour from './Pages/CampusTour';


// Communications
import SendCommunication from './Pages/SendCommunication';
import CommunicationHistory from './Pages/CommunicationHistory';

// Reports
import Reports from './Pages/Reports';


// Setup
// import Setup from './Pages/Setup';

import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <Admin />

        {/* Main Content */}
        <div style={{ flex: 1, padding: "20px" }}>
          <Routes>

            {/* Dashboard */}
            <Route path="/dashboard" element={<ManagementDashboard />} />

            {/* Lead Manager */}
            <Route path="/leads" element={<Leads />} />
            <Route path="/lead-follow-up" element={<LeadFollowUp />} />
            <Route path="/lead-data-port" element={<LeadDataPort />} />
            <Route path="/lead-data-update" element={<LeadDataUpdate />} />

            {/* Registration Manager */}
            <Route path="/reg-dashboard" element={<RegistrationDashboard />} />
            <Route path="/registrations" element={<Registrations />} />
            <Route path="/reg-follow-up" element={<RegistrationFollowUp />} />
            <Route path="/reg-data-port" element={<RegistrationDataPort />} />
            <Route path="/reg-update" element={<RegistrationDataUpdate />} />
            <Route path="/payments" element={<Payments />} />

            {/* School Tour */}

            <Route path="/campus-tour-dashboard" element={<CampusTourDashboard />} />
            <Route path="/campus-tour" element={<CampusTour />} />

            {/* Communications */}
            <Route path="/send-communication" element={<SendCommunication />} />
            <Route path="/communication-history" element={<CommunicationHistory />} />

            {/* Reports */}
            <Route path="/reports" element={<Reports />} />


            {/* Setup */}
            {/* <Route path="/setup" element={<Setup />} /> */}


          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
