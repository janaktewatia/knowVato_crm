const uid = () => Math.random().toString(36).slice(2, 9);

export const generateProfessionalFormDesign = (form) => {
  const elements = [];
  let zIndex = 1;

  // Background Image
  elements.push({
    id: uid(),
    type: "image",
    x: 0,
    y: 0,
    w: 600,
    h: 1000,
    label: "Background Image",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=1000&fit=crop",
    objectFit: "cover",
    opacity: 0.25,
    zIndex: zIndex++,
  });

  // Left side branding
  elements.push({
    id: uid(),
    type: "text",
    x: 20,
    y: 30,
    w: 280,
    h: 200,
    label: "Brand Background",
    content: "",
    bg: "rgba(51, 51, 51, 0.7)",
    borderRadius: 12,
    zIndex: zIndex++,
  });

  // Main Heading
  elements.push({
    id: uid(),
    type: "header",
    x: 40,
    y: 50,
    w: 240,
    h: 60,
    label: "Main Heading",
    content: "Welcome!",
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "left",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Subtitle
  elements.push({
    id: uid(),
    type: "text",
    x: 40,
    y: 120,
    w: 240,
    h: 60,
    label: "Brand Description",
    content: form?.formName + "\n\nFill out the form below",
    fontSize: 14,
    color: "#e0e0e0",
    textAlign: "left",
    lineHeight: 1.5,
    zIndex: zIndex++,
  });

  // Right side form container
  const formX = 320;
  const formW = 260;
  let currentY = 40;

  // Logo
  elements.push({
    id: uid(),
    type: "image",
    x: formX + 85,
    y: currentY,
    w: 90,
    h: 50,
    label: "Logo",
    imageUrl: "https://via.placeholder.com/90x50/667eea/ffffff?text=Logo",
    objectFit: "contain",
    zIndex: zIndex++,
  });

  currentY += 70;

  // Form Title
  elements.push({
    id: uid(),
    type: "header",
    x: formX + 10,
    y: currentY,
    w: formW - 20,
    h: 50,
    label: "Form Title",
    content: form?.formName || "Registration Form",
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  currentY += 60;

  // Form Subtitle
  elements.push({
    id: uid(),
    type: "text",
    x: formX + 10,
    y: currentY,
    w: formW - 20,
    h: 40,
    label: "Form Subtitle",
    content: "Please provide your information",
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  currentY += 50;

  // Form Fields Container
  elements.push({
    id: uid(),
    type: "text",
    x: formX + 5,
    y: currentY,
    w: formW - 10,
    h: 300,
    label: "Form Fields Container",
    content: "",
    bg: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    zIndex: zIndex++,
  });

  currentY += 320;

  // Submit Button
  elements.push({
    id: uid(),
    type: "text",
    x: formX + 10,
    y: currentY,
    w: formW - 20,
    h: 50,
    label: "Submit Button",
    content: "Register Now",
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    bg: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
    borderRadius: 10,
    zIndex: zIndex++,
  });

  currentY += 70;

  // Footer
  elements.push({
    id: uid(),
    type: "footer",
    x: 20,
    y: currentY,
    w: 560,
    h: 40,
    label: "Footer",
    content: "Powered by Event Management",
    fontSize: 12,
    fontWeight: "400",
    color: "#94a3b8",
    textAlign: "center",
    bg: "#f8fafc",
    borderRadius: 0,
    zIndex: zIndex++,
  });

  return elements;
};

export const generateModernFormDesign = (form) => {
  const elements = [];
  let zIndex = 1;

  // Background gradient
  elements.push({
    id: uid(),
    type: "text",
    x: 0,
    y: 0,
    w: 600,
    h: 1000,
    label: "Background",
    content: "",
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: 0,
    zIndex: zIndex++,
  });

  // Top accent bar
  elements.push({
    id: uid(),
    type: "text",
    x: 0,
    y: 0,
    w: 600,
    h: 8,
    label: "Accent Bar",
    content: "",
    bg: "#00d4ff",
    borderRadius: 0,
    zIndex: zIndex++,
  });

  // Header section with form name
  elements.push({
    id: uid(),
    type: "header",
    x: 40,
    y: 30,
    w: 520,
    h: 80,
    label: "Form Name Header",
    content: form?.formName || "Registration",
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Subtitle
  elements.push({
    id: uid(),
    type: "text",
    x: 40,
    y: 120,
    w: 520,
    h: 30,
    label: "Subtitle",
    content: "Complete the form to get started",
    fontSize: 14,
    color: "#e0e0e0",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Main form card
  elements.push({
    id: uid(),
    type: "text",
    x: 40,
    y: 180,
    w: 520,
    h: 620,
    label: "Form Card",
    content: "",
    bg: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    borderWidth: 0,
    zIndex: zIndex++,
  });

  // Form content - inner spacing
  let innerY = 220;

  // Fields intro
  elements.push({
    id: uid(),
    type: "text",
    x: 60,
    y: innerY,
    w: 480,
    h: 30,
    label: "Fields Header",
    content: "Personal Information",
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "left",
    bg: "transparent",
    zIndex: zIndex++,
  });

  innerY += 50;

  // Fields container
  elements.push({
    id: uid(),
    type: "text",
    x: 60,
    y: innerY,
    w: 480,
    h: 300,
    label: "Input Fields Container",
    content: "",
    bg: "transparent",
    zIndex: zIndex++,
  });

  innerY += 320;

  // Submit Button
  elements.push({
    id: uid(),
    type: "text",
    x: 60,
    y: innerY,
    w: 480,
    h: 50,
    label: "Submit Button",
    content: "Submit Form",
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: 8,
    zIndex: zIndex++,
  });

  // Footer
  elements.push({
    id: uid(),
    type: "footer",
    x: 40,
    y: 880,
    w: 520,
    h: 40,
    label: "Footer",
    content: "Your information is secure with us",
    fontSize: 12,
    color: "#cbd5e1",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  return elements;
};

export const generateMinimalFormDesign = (form) => {
  const elements = [];
  let zIndex = 1;

  // White background
  elements.push({
    id: uid(),
    type: "text",
    x: 0,
    y: 0,
    w: 600,
    h: 1000,
    label: "Background",
    content: "",
    bg: "#ffffff",
    borderRadius: 0,
    zIndex: zIndex++,
  });

  // Top border
  elements.push({
    id: uid(),
    type: "text",
    x: 0,
    y: 0,
    w: 600,
    h: 4,
    label: "Top Border",
    content: "",
    bg: "#333333",
    borderRadius: 0,
    zIndex: zIndex++,
  });

  // Form Title
  elements.push({
    id: uid(),
    type: "header",
    x: 40,
    y: 50,
    w: 520,
    h: 60,
    label: "Form Title",
    content: form?.formName || "Form",
    fontSize: 32,
    fontWeight: "700",
    color: "#000000",
    textAlign: "left",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Divider
  elements.push({
    id: uid(),
    type: "divider",
    x: 40,
    y: 130,
    w: 520,
    h: 1,
    label: "Divider",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    zIndex: zIndex++,
  });

  // Form description
  elements.push({
    id: uid(),
    type: "text",
    x: 40,
    y: 160,
    w: 520,
    h: 30,
    label: "Description",
    content: "Fill in the details below to complete registration",
    fontSize: 14,
    color: "#666666",
    textAlign: "left",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Form fields area
  elements.push({
    id: uid(),
    type: "text",
    x: 40,
    y: 220,
    w: 520,
    h: 400,
    label: "Fields Area",
    content: "",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Submit Button
  elements.push({
    id: uid(),
    type: "text",
    x: 40,
    y: 660,
    w: 520,
    h: 48,
    label: "Submit Button",
    content: "Continue",
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    bg: "#000000",
    borderRadius: 4,
    zIndex: zIndex++,
  });

  // Footer text
  elements.push({
    id: uid(),
    type: "footer",
    x: 40,
    y: 740,
    w: 520,
    h: 30,
    label: "Footer",
    content: "We respect your privacy",
    fontSize: 12,
    color: "#999999",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  return elements;
};
