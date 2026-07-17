import { Outlet } from "react-router-dom";

// Side-effect CSS for the Event Manager subtree. Bootstrap is loaded
// globally — host shadcn pages may render slightly differently while these
// are loaded, but it keeps the ported pages visually identical to the source.
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/event-manager/index.css";
import "@/event-manager/App.css";
import "@/event-manager/styles/custom.css";

import { EventDataProvider } from "@/event-manager/context/EventDataContext";
import { QRProvider } from "@/event-manager/context/QRContext";
import { FormProvider } from "@/event-manager/context/FormContext";
import { HistoryProvider } from "@/event-manager/context/HistoryContext";
import { AuthProvider } from "@/event-manager/context/AuthContext";

const A: any = AuthProvider;
const E: any = EventDataProvider;
const F: any = FormProvider;
const Q: any = QRProvider;
const H: any = HistoryProvider;

export default function EventManagerLayout() {
  return (
    <A>
      <E>
        <F>
          <Q>
            <H>
              <div className="em-shell">
                <Outlet />
              </div>
            </H>
          </Q>
        </F>
      </E>
    </A>
  );
}
