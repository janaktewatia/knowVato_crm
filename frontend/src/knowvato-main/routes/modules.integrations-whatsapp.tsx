import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import WhatsAppIntegrationManager from "../../components/WhatsAppIntegrationManager";

export default function WhatsAppIntegrationPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      <WhatsAppIntegrationManager
        showHeader={true}
        backLink={
          <Link to="/" className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1 mb-2">
            <ArrowLeft className="h-3 w-3" /> Back to dashboard
          </Link>
        }
      />
    </div>
  );
}
