const uid = () => Math.random().toString(36).slice(2, 9);

export const generateProfessionalPassDesign = (event) => {
  const elements = [];
  let zIndex = 1;

  // Background gradient
  elements.push({
    id: uid(),
    type: "text",
    x: 0,
    y: 0,
    w: 400,
    h: 600,
    label: "Background",
    content: "",
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: 0,
    zIndex: zIndex++,
  });

  // Header section
  elements.push({
    id: uid(),
    type: "header",
    x: 20,
    y: 20,
    w: 360,
    h: 80,
    label: "Event Name",
    content: event?.eventName || "Event Name",
    fontSize: 32,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Event Date
  elements.push({
    id: uid(),
    type: "text",
    x: 20,
    y: 110,
    w: 360,
    h: 30,
    label: "Date",
    content: "{{startDate}}",
    fontSize: 14,
    color: "#e0e0e0",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Divider
  elements.push({
    id: uid(),
    type: "divider",
    x: 40,
    y: 160,
    w: 320,
    h: 1,
    label: "Divider 1",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    zIndex: zIndex++,
  });

  // Attendee Info Box
  elements.push({
    id: uid(),
    type: "card",
    x: 30,
    y: 190,
    w: 340,
    h: 180,
    label: "Info Card",
    content: "",
    bg: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    zIndex: zIndex++,
  });

  // Name Label
  elements.push({
    id: uid(),
    type: "text",
    x: 50,
    y: 210,
    w: 100,
    h: 20,
    label: "Name Label",
    content: "Name:",
    fontSize: 12,
    color: "#b0b0b0",
    fontWeight: "600",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Name Value
  elements.push({
    id: uid(),
    type: "text",
    x: 50,
    y: 235,
    w: 300,
    h: 28,
    label: "Attendee Name",
    content: "{{name}}",
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Category Label
  elements.push({
    id: uid(),
    type: "text",
    x: 50,
    y: 280,
    w: 100,
    h: 20,
    label: "Category Label",
    content: "Category:",
    fontSize: 12,
    color: "#b0b0b0",
    fontWeight: "600",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Category Value
  elements.push({
    id: uid(),
    type: "text",
    x: 50,
    y: 305,
    w: 200,
    h: 24,
    label: "Category",
    content: "{{category}}",
    fontSize: 16,
    fontWeight: "600",
    color: "#ffd700",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Venue
  elements.push({
    id: uid(),
    type: "text",
    x: 50,
    y: 345,
    w: 300,
    h: 40,
    label: "Venue Info",
    content: "📍 {{venue}}",
    fontSize: 12,
    color: "#e0e0e0",
    textAlign: "left",
    bg: "transparent",
    lineHeight: 1.5,
    zIndex: zIndex++,
  });

  // Divider 2
  elements.push({
    id: uid(),
    type: "divider",
    x: 40,
    y: 410,
    w: 320,
    h: 1,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    zIndex: zIndex++,
  });

  // QR Code
  elements.push({
    id: uid(),
    type: "qr",
    x: 150,
    y: 445,
    w: 100,
    h: 100,
    label: "QR Code",
    content: "{{passId}}",
    bg: "#ffffff",
    borderRadius: 8,
    zIndex: zIndex++,
  });

  // Footer
  elements.push({
    id: uid(),
    type: "footer",
    x: 20,
    y: 560,
    w: 360,
    h: 30,
    label: "Footer",
    content: "Scan QR code at entry",
    fontSize: 11,
    color: "#b0b0b0",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  return elements;
};

export const generateModernPassDesign = (event) => {
  const elements = [];
  let zIndex = 1;

  // Background - solid color
  elements.push({
    id: uid(),
    type: "text",
    x: 0,
    y: 0,
    w: 400,
    h: 600,
    label: "Background",
    content: "",
    bg: "#1a1a2e",
    borderRadius: 0,
    zIndex: zIndex++,
  });

  // Top colored accent
  elements.push({
    id: uid(),
    type: "text",
    x: 0,
    y: 0,
    w: 400,
    h: 12,
    label: "Accent Bar",
    content: "",
    bg: "#00d4ff",
    borderRadius: 0,
    zIndex: zIndex++,
  });

  // Event branding
  elements.push({
    id: uid(),
    type: "header",
    x: 20,
    y: 30,
    w: 360,
    h: 60,
    label: "Event Title",
    content: event?.eventName || "Event",
    fontSize: 28,
    fontWeight: "700",
    color: "#00d4ff",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Subtitle
  elements.push({
    id: uid(),
    type: "text",
    x: 20,
    y: 100,
    w: 360,
    h: 25,
    label: "Subtitle",
    content: "VIP Pass",
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Main content area
  elements.push({
    id: uid(),
    type: "card",
    x: 20,
    y: 145,
    w: 360,
    h: 320,
    label: "Main Card",
    content: "",
    bg: "rgba(0, 212, 255, 0.05)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#00d4ff",
    zIndex: zIndex++,
  });

  // Attendee section
  elements.push({
    id: uid(),
    type: "text",
    x: 40,
    y: 170,
    w: 80,
    h: 20,
    label: "Name Label",
    content: "Attendee",
    fontSize: 11,
    fontWeight: "600",
    color: "#666666",
    textAlign: "left",
    bg: "transparent",
    zIndex: zIndex++,
  });

  elements.push({
    id: uid(),
    type: "text",
    x: 40,
    y: 195,
    w: 320,
    h: 30,
    label: "Name",
    content: "{{name}}",
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "left",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Email
  elements.push({
    id: uid(),
    type: "text",
    x: 40,
    y: 235,
    w: 320,
    h: 20,
    label: "Email",
    content: "{{email}}",
    fontSize: 11,
    color: "#888888",
    textAlign: "left",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Category badge
  elements.push({
    id: uid(),
    type: "text",
    x: 40,
    y: 270,
    w: 120,
    h: 35,
    label: "Category Badge",
    content: "{{category}}",
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a2e",
    textAlign: "center",
    bg: "#00d4ff",
    borderRadius: 6,
    paddingX: 10,
    paddingY: 8,
    zIndex: zIndex++,
  });

  // Date and Venue
  elements.push({
    id: uid(),
    type: "text",
    x: 40,
    y: 320,
    w: 320,
    h: 50,
    label: "Details",
    content: "📅 {{startDate}}\n📍 {{venue}}",
    fontSize: 12,
    color: "#cccccc",
    textAlign: "left",
    bg: "transparent",
    lineHeight: 1.6,
    zIndex: zIndex++,
  });

  // QR Code section
  elements.push({
    id: uid(),
    type: "qr",
    x: 150,
    y: 495,
    w: 100,
    h: 100,
    label: "QR Code",
    content: "{{passId}}",
    bg: "#ffffff",
    borderRadius: 8,
    zIndex: zIndex++,
  });

  return elements;
};

export const generateMinimalPassDesign = (event) => {
  const elements = [];
  let zIndex = 1;

  // White background
  elements.push({
    id: uid(),
    type: "text",
    x: 0,
    y: 0,
    w: 400,
    h: 600,
    label: "Background",
    content: "",
    bg: "#ffffff",
    borderRadius: 0,
    zIndex: zIndex++,
  });

  // Subtle top border
  elements.push({
    id: uid(),
    type: "text",
    x: 0,
    y: 0,
    w: 400,
    h: 4,
    label: "Top Border",
    content: "",
    bg: "#333333",
    borderRadius: 0,
    zIndex: zIndex++,
  });

  // Event name
  elements.push({
    id: uid(),
    type: "header",
    x: 20,
    y: 40,
    w: 360,
    h: 50,
    label: "Event Name",
    content: event?.eventName || "Event",
    fontSize: 24,
    fontWeight: "700",
    color: "#333333",
    textAlign: "left",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Horizontal line
  elements.push({
    id: uid(),
    type: "divider",
    x: 20,
    y: 110,
    w: 360,
    h: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    zIndex: zIndex++,
  });

  // Attendee name - large
  elements.push({
    id: uid(),
    type: "text",
    x: 20,
    y: 150,
    w: 360,
    h: 35,
    label: "Attendee Name",
    content: "{{name}}",
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    textAlign: "left",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Category
  elements.push({
    id: uid(),
    type: "text",
    x: 20,
    y: 200,
    w: 200,
    h: 25,
    label: "Category",
    content: "{{category}}",
    fontSize: 14,
    fontWeight: "600",
    color: "#666666",
    textAlign: "left",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Event details
  elements.push({
    id: uid(),
    type: "text",
    x: 20,
    y: 250,
    w: 360,
    h: 60,
    label: "Event Info",
    content: "{{startDate}} | {{venue}}",
    fontSize: 12,
    color: "#999999",
    textAlign: "left",
    bg: "transparent",
    lineHeight: 1.6,
    zIndex: zIndex++,
  });

  // QR Code
  elements.push({
    id: uid(),
    type: "qr",
    x: 150,
    y: 400,
    w: 100,
    h: 100,
    label: "QR Code",
    content: "{{passId}}",
    bg: "#f5f5f5",
    borderRadius: 0,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    zIndex: zIndex++,
  });

  // Pass ID
  elements.push({
    id: uid(),
    type: "text",
    x: 20,
    y: 520,
    w: 360,
    h: 20,
    label: "Pass ID",
    content: "ID: {{passId}}",
    fontSize: 10,
    color: "#cccccc",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Footer
  elements.push({
    id: uid(),
    type: "footer",
    x: 20,
    y: 560,
    w: 360,
    h: 20,
    label: "Footer",
    content: "Keep this pass for entry",
    fontSize: 10,
    color: "#999999",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  return elements;
};
