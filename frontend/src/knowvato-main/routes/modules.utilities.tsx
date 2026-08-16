import { Outlet } from "react-router-dom";

// Side-effect CSS for Event Manager / QR Code subtree
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

export default function UtilitiesLayout() {
  return (
    <A>
      <E>
        <F>
          <Q>
            <H>
              <div className="utilities-shell w-full">
                <Outlet />
              </div>
            </H>
          </Q>
        </F>
      </E>
    </A>
  );
}
