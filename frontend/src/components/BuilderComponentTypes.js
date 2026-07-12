// Core element types available in the visual builder
// Over 15 options configured for each of the 7 sections
export const COMPONENT_TYPES = [
  // ==================== Category: PRESETS (16 items) ====================
  {
    type: "header-nav",
    name: "Navigation Header",
    icon: "bi-menu-button-wide",
    category: "presets",
    defaultContent: {
      presetType: "type1",
      logoUrl: "https://clarwynschool.com/wp-content/themes/astra/assets/images/logo.png",
      logoWidth: "50px",
      logoLink: "#",
      brandName: "Acme Academy",
      phone: "+91 9012559012",
      email: "admissions@acmeacademy.edu",
      menuLinks: [
        { label: "Home", url: "#" },
        { label: "Admissions", url: "#contact-form" },
        { label: "Contact Us", url: "#footer" }
      ],
      buttonText: "Apply Now",
      buttonLink: "#contact-form",
      showButton: true
    },
    defaultStyles: {
      width: "100%",
      height: "auto",
      paddingTop: "15px",
      paddingBottom: "15px",
      paddingLeft: "20px",
      paddingRight: "20px",
      marginTop: "0px",
      marginBottom: "0px",
      backgroundColor: "#ffffff",
      textColor: "#1e293b",
      borderRadius: "0px",
      boxShadow: "none"
    }
  },
  {
    type: "hero-split",
    name: "Split Hero (Text + Form)",
    icon: "bi-columns-gap",
    category: "presets",
    defaultContent: {
      presetType: "type1",
      badgeText: "ADMISSIONS OPEN 2026",
      title: "Shape Your Future Here",
      subtitle: "Experience modern learning, advanced research laboratories, and personalized mentorship to achieve your full potential.",
      formTitle: "Quick Enquiry",
      formType: "enquiry_form",
      enquiryFormId: "",
      bgImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      ctaText: "Explore Programs",
      ctaLink: "#details"
    },
    defaultStyles: {
      width: "100%",
      height: "auto",
      paddingTop: "80px",
      paddingBottom: "80px",
      paddingLeft: "20px",
      paddingRight: "20px",
      marginTop: "0px",
      marginBottom: "0px",
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      borderRadius: "0px",
      boxShadow: "none"
    }
  },
  {
    type: "feature-showcase",
    name: "Numbered Focus Cards",
    icon: "bi-sort-numeric-down",
    category: "presets",
    defaultContent: {
      presetType: "type1",
      title: "Our Academic Identity",
      items: [
        { num: "01", heading: "Inquiry-Based Learning", text: "Hands-on application and student-led exploration shape our daily learning cycles." },
        { num: "02", heading: "Global Curriculum", text: "CBSE aligned with international early years and STEM integrations." },
        { num: "03", heading: "Futuristic Campus", text: "Interactive smart classrooms and industry-grade tech laboratories." }
      ]
    },
    defaultStyles: {
      width: "100%",
      height: "auto",
      paddingTop: "50px",
      paddingBottom: "50px",
      paddingLeft: "20px",
      paddingRight: "20px",
      marginTop: "0px",
      marginBottom: "0px",
      backgroundColor: "#f8fafc",
      textColor: "#0f172a",
      borderRadius: "0px",
      boxShadow: "none"
    }
  },
  {
    type: "features",
    name: "Showcase Features Grid",
    icon: "bi-grid-3x3-gap",
    category: "presets",
    defaultContent: {
      presetType: "type1",
      title: "Our Advantages",
      columns: 3,
      items: [
        { title: "STEM Focus", desc: "Advanced robotics and science labs.", icon: "bi-cpu" },
        { title: "Sports Complex", desc: "Professional turf and swimming pool.", icon: "bi-trophy" },
        { title: "Global Network", desc: "Collaborate with international institutions.", icon: "bi-globe" }
      ]
    },
    defaultStyles: {
      width: "100%",
      height: "auto",
      paddingTop: "50px",
      paddingBottom: "50px",
      paddingLeft: "20px",
      paddingRight: "20px",
      marginTop: "0px",
      marginBottom: "0px",
      backgroundColor: "#f8fafc",
      textColor: "#0f172a"
    }
  },
  {
    type: "testimonials",
    name: "Testimonials Card",
    icon: "bi-chat-quote",
    category: "presets",
    defaultContent: {
      presetType: "type1",
      title: "What Parents Say",
      items: [
        { name: "Pooja Sharma", role: "Parent of Grade 5 Student", text: "The individual attention my daughter receives here is unmatched. Her confidence has soared!", photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150" },
        { name: "Vikram Malhotra", role: "Parent of Grade 9 Student", text: "Excellent infrastructure combined with a futuristic curriculum. Highly recommended.", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150" }
      ]
    },
    defaultStyles: {
      width: "100%",
      height: "auto",
      paddingTop: "50px",
      paddingBottom: "50px",
      paddingLeft: "20px",
      paddingRight: "20px",
      marginTop: "0px",
      marginBottom: "0px",
      backgroundColor: "#f1f5f9"
    }
  },
  {
    type: "faq",
    name: "FAQ Accordion Presets",
    icon: "bi-question-circle",
    category: "presets",
    defaultContent: {
      title: "Frequently Asked Questions",
      items: [
        { q: "What is the teacher-to-student ratio?", a: "We maintain a 1:15 ratio to ensure personal guidance for every child." },
        { q: "Are admissions open mid-session?", a: "Yes, admissions are open depending on vacancy availability." }
      ]
    },
    defaultStyles: {
      width: "100%",
      height: "auto",
      paddingTop: "40px",
      paddingBottom: "40px",
      paddingLeft: "20px",
      paddingRight: "20px",
      marginTop: "0px",
      marginBottom: "0px",
      backgroundColor: "#ffffff"
    }
  },
  {
    type: "pricing",
    name: "Pricing Cards Presets",
    icon: "bi-credit-card",
    category: "presets",
    defaultContent: {
      presetType: "type1",
      title: "Programs & Fees Structure",
      items: [
        { name: "Primary Program", price: "$2,400", period: "per term", features: ["Core Curriculum", "Interactive Labs", "Basic Sports"], buttonText: "Apply Now" },
        { name: "Advanced STEM", price: "$3,600", period: "per term", features: ["Robotics & Coding", "International Projects", "1-on-1 Mentorship"], buttonText: "Apply Now", highlight: true }
      ]
    },
    defaultStyles: {
      width: "100%",
      height: "auto",
      paddingTop: "50px",
      paddingBottom: "50px",
      paddingLeft: "20px",
      paddingRight: "20px",
      marginTop: "0px",
      marginBottom: "0px",
      backgroundColor: "#fafafa"
    }
  },
  {
    type: "footer",
    name: "Footer Section",
    icon: "bi-layout-sidebar-reverse",
    category: "presets",
    defaultContent: {
      presetType: "type1",
      address: "A-04, Sector 145, Noida Expressway, U.P.",
      phone: "+91 9012559012",
      email: "admissions@acmeacademy.edu",
      copyright: "© 2026 Acme Academy. All rights reserved."
    },
    defaultStyles: {
      width: "100%",
      height: "auto",
      paddingTop: "40px",
      paddingBottom: "40px",
      paddingLeft: "20px",
      paddingRight: "20px",
      marginTop: "0px",
      marginBottom: "0px",
      backgroundColor: "#0f172a",
      textColor: "#94a3b8",
      borderRadius: "0px",
      boxShadow: "none"
    }
  },
  {
    type: "about-us-preset",
    name: "About Us Showcase",
    icon: "bi-info-square",
    category: "presets",
    defaultContent: {
      title: "About Our Institution",
      subtitle: "Established in 1998, we have nurtured thousands of global leaders through quality education.",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=800",
      ctaText: "Read History",
      ctaLink: "#"
    },
    defaultStyles: {
      width: "100%",
      backgroundColor: "#ffffff",
      textColor: "#334155",
      paddingTop: "40px",
      paddingBottom: "40px"
    }
  },
  {
    type: "contact-preset",
    name: "Contact Info Banner",
    icon: "bi-telephone-inbound",
    category: "presets",
    defaultContent: {
      title: "Get In Touch Today",
      email: "support@clarwyn.edu",
      phone: "+1 (555) 019-2834",
      hours: "Mon - Fri, 9:00 AM to 5:00 PM"
    },
    defaultStyles: {
      width: "100%",
      backgroundColor: "#2249b7",
      textColor: "#ffffff",
      paddingTop: "40px",
      paddingBottom: "40px"
    }
  },
  {
    type: "team-preset",
    name: "Team Directory Grid",
    icon: "bi-people",
    category: "presets",
    defaultContent: {
      title: "Meet Our Educators",
      items: [
        { name: "Dr. Sarah Jenkins", role: "Principal / Academic Dean", photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150" },
        { name: "Prof. Alan Turing", role: "Head of Computer Science", photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150" }
      ]
    },
    defaultStyles: {
      width: "100%",
      backgroundColor: "#f8fafc",
      textColor: "#1e293b",
      paddingTop: "40px",
      paddingBottom: "40px"
    }
  },
  {
    type: "clients-preset",
    name: "Affiliated Partners Cloud",
    icon: "bi-images",
    category: "presets",
    defaultContent: {
      title: "Accredited Partners",
      logos: [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=100",
        "https://images.unsplash.com/photo-1618005198143-e5283b519a7f?q=80&w=100"
      ]
    },
    defaultStyles: {
      width: "100%",
      backgroundColor: "#ffffff",
      paddingTop: "30px",
      paddingBottom: "30px"
    }
  },
  {
    type: "stats-preset",
    name: "Statistics Metrics Showcase",
    icon: "bi-bar-chart",
    category: "presets",
    defaultContent: {
      title: "Milestones in Numbers",
      items: [
        { val: "25+", label: "Academic Programs" },
        { val: "10k+", label: "Graduated Alumni" },
        { val: "98%", label: "Placement Success" }
      ]
    },
    defaultStyles: {
      width: "100%",
      backgroundColor: "#0f172a",
      textColor: "#ffffff",
      paddingTop: "45px",
      paddingBottom: "45px"
    }
  },
  {
    type: "workflow-preset",
    name: "Workflow Process Timeline",
    icon: "bi-list-ol",
    category: "presets",
    defaultContent: {
      title: "Our Simple Admission Flow",
      items: [
        { step: "Step 1", title: "Submit Online Inquiry Form" },
        { step: "Step 2", title: "Counseling Interview Session" },
        { step: "Step 3", title: "Seat Reservation & Deposit Payment" }
      ]
    },
    defaultStyles: {
      width: "100%",
      backgroundColor: "#ffffff",
      textColor: "#0f172a",
      paddingTop: "50px",
      paddingBottom: "50px"
    }
  },
  {
    type: "careers-preset",
    name: "Job/Careers List Grid",
    icon: "bi-briefcase",
    category: "presets",
    defaultContent: {
      title: "Join Our Faculty Team",
      items: [
        { title: "Senior Math Educator", loc: "New York Campus", type: "Full-Time" },
        { title: "Student Counselor", loc: "Remote US / Canada", type: "Part-Time" }
      ]
    },
    defaultStyles: {
      width: "100%",
      backgroundColor: "#f8fafc",
      textColor: "#334155",
      paddingTop: "40px",
      paddingBottom: "40px"
    }
  },
  {
    type: "portfolio-preset",
    name: "Admissions Portfolio Gallery",
    icon: "bi-collection",
    category: "presets",
    defaultContent: {
      title: "Our State of the Art Facilities",
      items: [
        "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=300",
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=300"
      ]
    },
    defaultStyles: {
      width: "100%",
      backgroundColor: "#ffffff",
      paddingTop: "50px",
      paddingBottom: "50px"
    }
  },

  // ==================== Category: BASIC (16 items) ====================
  {
    type: "heading",
    name: "Heading Text",
    icon: "bi-header",
    category: "basic",
    defaultContent: { text: "Write your heading here" },
    defaultStyles: { width: "100%", height: "auto", fontSize: "32px", fontWeight: "700", fontStyle: "normal", textColor: "#1e293b", textAlign: "left", paddingTop: "10px", paddingBottom: "10px", paddingLeft: "0px", paddingRight: "0px", marginTop: "0px", marginBottom: "0px" }
  },
  {
    type: "paragraph",
    name: "Paragraph Text",
    icon: "bi-justify-left",
    category: "basic",
    defaultContent: { text: "Write your paragraph body copy here. This is fully customizable." },
    defaultStyles: { width: "100%", height: "auto", fontSize: "16px", fontWeight: "400", fontStyle: "normal", textColor: "#475569", textAlign: "left", paddingTop: "10px", paddingBottom: "10px", paddingLeft: "0px", paddingRight: "0px", marginTop: "0px", marginBottom: "0px" }
  },
  {
    type: "logo",
    name: "Logo Image",
    icon: "bi-building",
    category: "basic",
    defaultContent: { logoUrl: "https://clarwynschool.com/wp-content/themes/astra/assets/images/logo.png", logoWidth: "120px", align: "left", linkUrl: "#" },
    defaultStyles: { width: "auto", height: "auto", paddingTop: "10px", paddingBottom: "10px", paddingLeft: "0px", paddingRight: "0px", marginTop: "0px", marginBottom: "0px" }
  },
  {
    type: "image",
    name: "Static Image",
    icon: "bi-image",
    category: "basic",
    defaultContent: { imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200", altText: "Image description", width: "100%", height: "350px", align: "center", linkUrl: "" },
    defaultStyles: { width: "100%", height: "auto", paddingTop: "10px", paddingBottom: "10px", paddingLeft: "0px", paddingRight: "0px", marginTop: "0px", marginBottom: "0px", borderRadius: "12px" }
  },
  {
    type: "button",
    name: "Action Button",
    icon: "bi-hand-index-thumb",
    category: "basic",
    defaultContent: { text: "Click Here", linkUrl: "#", iconClass: "bi-arrow-right", btnColor: "#2249b7", textColor: "#ffffff", width: "auto", align: "left" },
    defaultStyles: { width: "auto", height: "auto", fontSize: "16px", fontWeight: "600", borderRadius: "8px", paddingTop: "12px", paddingBottom: "12px", paddingLeft: "24px", paddingRight: "24px", marginTop: "10px", marginBottom: "10px", boxShadow: "none" }
  },
  {
    type: "divider",
    name: "Line Divider",
    icon: "bi-dash-lg",
    category: "basic",
    defaultContent: { color: "#e2e8f0", thickness: "2px", width: "100%" },
    defaultStyles: { width: "100%", height: "auto", paddingTop: "20px", paddingBottom: "20px", paddingLeft: "0px", paddingRight: "0px", marginTop: "0px", marginBottom: "0px" }
  },
  {
    type: "spacer",
    name: "Blank Spacer",
    icon: "bi-distribute-vertical",
    category: "basic",
    defaultContent: { height: "40px" },
    defaultStyles: { width: "100%", paddingTop: "0px", paddingBottom: "0px", marginTop: "0px", marginBottom: "0px" }
  },
  {
    type: "icon",
    name: "Custom Icon",
    icon: "bi-star-fill",
    category: "basic",
    defaultContent: { iconClass: "bi-patch-check-fill", color: "#2249b7", size: "40px", align: "left", linkUrl: "" },
    defaultStyles: { width: "auto", height: "auto", paddingTop: "10px", paddingBottom: "10px", paddingLeft: "0px", paddingRight: "0px", marginTop: "0px", marginBottom: "0px" }
  },
  {
    type: "label",
    name: "Inline Label",
    icon: "bi-tag",
    category: "basic",
    defaultContent: { text: "Tag/Label Item" },
    defaultStyles: { fontSize: "12px", textColor: "#ffffff", backgroundColor: "#ef4444", borderRadius: "4px", paddingLeft: "8px", paddingRight: "8px", paddingTop: "2px", paddingBottom: "2px" }
  },
  {
    type: "quote",
    name: "Quote Block",
    icon: "bi-chat-left-quote",
    category: "basic",
    defaultContent: { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    defaultStyles: { fontSize: "16px", fontStyle: "italic", textColor: "#475569", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "badge",
    name: "Badge Pill",
    icon: "bi-award",
    category: "basic",
    defaultContent: { text: "URGENT UPDATE" },
    defaultStyles: { fontSize: "11px", textColor: "#ffffff", backgroundColor: "#e11d48", borderRadius: "20px", paddingLeft: "12px", paddingRight: "12px" }
  },
  {
    type: "bullet-list",
    name: "Bullet Point List",
    icon: "bi-list-ul",
    category: "basic",
    defaultContent: { items: ["Core Curriculum Courses", "Extracurricular Sports Programs", "Laboratory Practice Sessions"] },
    defaultStyles: { fontSize: "15px", textColor: "#334155", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "alert-bar",
    name: "Notice Alert Bar",
    icon: "bi-exclamation-triangle",
    category: "basic",
    defaultContent: { text: "Notice: Registrations are closing this Friday at midnight." },
    defaultStyles: { backgroundColor: "#fef3c7", textColor: "#d97706", borderRadius: "6px", paddingTop: "8px", paddingBottom: "8px", paddingLeft: "12px" }
  },
  {
    type: "icon-list",
    name: "Checked Icon List",
    icon: "bi-check2-circle",
    category: "basic",
    defaultContent: { items: ["Fully Air-conditioned Classrooms", "Smart Interactive Projectors", "24/7 Security & CCTV Monitoring"] },
    defaultStyles: { fontSize: "15px", textColor: "#0f172a", paddingTop: "8px", paddingBottom: "8px" }
  },
  {
    type: "text-link",
    name: "Simple Text Link",
    icon: "bi-link",
    category: "basic",
    defaultContent: { text: "Read full admissions handbook here", url: "#" },
    defaultStyles: { fontSize: "14px", textColor: "#2249b7", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "title-group",
    name: "Title Subtitle Block",
    icon: "bi-journal-text",
    category: "basic",
    defaultContent: { title: "Section Core Header", subtitle: "A short body copy describing details of this section header." },
    defaultStyles: { paddingTop: "10px", paddingBottom: "10px" }
  },

  // ==================== Category: FORM FIELDS (19 items) ====================
  {
    type: "text-input",
    name: "Text Input Field",
    icon: "bi-input-cursor-text",
    category: "form",
    defaultContent: { label: "Student First Name", placeholder: "e.g. Priyansh", required: true },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "textarea-input",
    name: "Textarea Field",
    icon: "bi-textarea-t",
    category: "form",
    defaultContent: { label: "Reason for Admission", placeholder: "Tell us about student background...", required: false },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "number-input",
    name: "Number Input Field",
    icon: "bi-hash",
    category: "form",
    defaultContent: { label: "Age of Student", placeholder: "e.g. 5", required: true },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "email-input",
    name: "Email Input Field",
    icon: "bi-envelope",
    category: "form",
    defaultContent: { label: "Parent Email Address", placeholder: "name@example.com", required: true },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "phone-input",
    name: "Phone Input Field",
    icon: "bi-phone",
    category: "form",
    defaultContent: { label: "Parent WhatsApp Number", placeholder: "+91 XXXXX XXXXX", required: true },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "password-input",
    name: "Password Field",
    icon: "bi-key",
    category: "form",
    defaultContent: { label: "Create Account Password", placeholder: "Secret key", required: true },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "otp-input",
    name: "OTP Verification",
    icon: "bi-shield-lock",
    category: "form",
    defaultContent: { label: "Enter OTP Sent via SMS", digits: 6 },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "date-input",
    name: "Date Field",
    icon: "bi-calendar-date",
    category: "form",
    defaultContent: { label: "Date of Birth", required: true },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "time-input",
    name: "Time Field",
    icon: "bi-clock",
    category: "form",
    defaultContent: { label: "Preferred Interview Time", required: false },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "datetime-input",
    name: "Date & Time Field",
    icon: "bi-calendar2-range",
    category: "form",
    defaultContent: { label: "Appointment Slot Selection", required: false },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "dropdown-input",
    name: "Dropdown List",
    icon: "bi-chevron-expand",
    category: "form",
    defaultContent: { label: "Select Applying Class", options: "Nursery, Pre-KG, LKG, UKG, Class I", required: true },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "multiselect-input",
    name: "Multi-Select Tags",
    icon: "bi-tags",
    category: "form",
    defaultContent: { label: "Extracurricular Interests", options: "Football, Cricket, Swimming, Music, Robotics", required: false },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "radio-group-input",
    name: "Radio Group List",
    icon: "bi-ui-checks-grid",
    category: "form",
    defaultContent: { label: "Gender of Student", options: "Male, Female, Other", required: false },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "checkbox-input",
    name: "Terms Checkbox",
    icon: "bi-check-square",
    category: "form",
    defaultContent: { label: "I agree to school terms of admission rules", required: true },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "switch-input",
    name: "Toggle Switch",
    icon: "bi-toggle-on",
    category: "form",
    defaultContent: { label: "Subscribe to SMS Notifications" },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "slider-input",
    name: "Range Slider",
    icon: "bi-sliders",
    category: "form",
    defaultContent: { label: "Expected Tuition Fee Budget", min: 1000, max: 10000 },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "rating-input",
    name: "Star Rating Scale",
    icon: "bi-star-half",
    category: "form",
    defaultContent: { label: "Rate Admission Portal Experience", maxStars: 5 },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "upload-input",
    name: "Document Upload",
    icon: "bi-cloud-upload",
    category: "form",
    defaultContent: { label: "Upload Student Aadhar Card (.pdf)", accept: ".pdf,.jpg" },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "location-input",
    name: "Location Picker",
    icon: "bi-geo-alt",
    category: "form",
    defaultContent: { label: "Home Address Map Coordinates" },
    defaultStyles: { width: "100%", paddingTop: "5px", paddingBottom: "5px" }
  },

  // ==================== Category: LAYOUT BOXES (16 items) ====================
  {
    type: "layout-section",
    name: "Section Wrapper",
    icon: "bi-border-style",
    category: "layout",
    defaultContent: { label: "Full Section Outer Box" },
    defaultStyles: { width: "100%", backgroundColor: "#f8fafc", paddingTop: "20px", paddingBottom: "20px", paddingLeft: "20px", paddingRight: "20px" }
  },
  {
    type: "layout-container",
    name: "Flex Container",
    icon: "bi-box",
    category: "layout",
    defaultContent: { label: "Inner Container Center" },
    defaultStyles: { width: "90%", backgroundColor: "#ffffff", paddingLeft: "15px", paddingRight: "15px", borderRadius: "10px" }
  },
  {
    type: "layout-row",
    name: "Layout Flex Row",
    icon: "bi-layout-three-columns",
    category: "layout",
    defaultContent: { label: "Flex Grid Row" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "layout-column",
    name: "Layout Column Box",
    icon: "bi-layout-sidebar",
    category: "layout",
    defaultContent: { label: "Grid Column Item" },
    defaultStyles: { width: "50%", paddingLeft: "10px", paddingRight: "10px" }
  },
  {
    type: "layout-card",
    name: "Styled Card Box",
    icon: "bi-card-text",
    category: "layout",
    defaultContent: { title: "Interactive Card Frame", text: "Place elements inside this frame box." },
    defaultStyles: { width: "100%", backgroundColor: "#ffffff", borderRadius: "12px", borderWidth: "1px", borderColor: "#e2e8f0", paddingLeft: "20px", paddingRight: "20px", paddingTop: "20px", paddingBottom: "20px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }
  },
  {
    type: "layout-grid",
    name: "Grid Layout Frame",
    icon: "bi-grid",
    category: "layout",
    defaultContent: { cols: 3, gap: "15px" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "layout-accordion",
    name: "Accordion Collapse",
    icon: "bi-caret-down-square",
    category: "layout",
    defaultContent: { items: "Term 1 Syllabus, Term 2 Syllabus, Sports Schedule" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "layout-tabs",
    name: "Segment Tab Panels",
    icon: "bi-segmented-control",
    category: "layout",
    defaultContent: { items: "Curriculum, Admission, Fee Structure" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "layout-split",
    name: "Split Panels (50:50)",
    icon: "bi-layout-split",
    category: "layout",
    defaultContent: { label: "Split Row half grid" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "layout-flex",
    name: "Responsive FlexBox",
    icon: "bi-boxes",
    category: "layout",
    defaultContent: { direction: "row", justify: "space-between" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "layout-sidebar-left",
    name: "Left Sidebar Panel",
    icon: "bi-layout-sidebar-inset",
    category: "layout",
    defaultContent: { sidebarWidth: "30%" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "layout-sidebar-right",
    name: "Right Sidebar Panel",
    icon: "bi-layout-sidebar-inset-reverse",
    category: "layout",
    defaultContent: { sidebarWidth: "30%" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "layout-center",
    name: "Centered content wrapper",
    icon: "bi-aspect-ratio",
    category: "layout",
    defaultContent: { label: "Absolute Centered Box" },
    defaultStyles: { width: "100%", paddingTop: "15px", paddingBottom: "15px" }
  },
  {
    type: "layout-3col",
    name: "3-Column Grid Frame",
    icon: "bi-grid-3x3",
    category: "layout",
    defaultContent: { label: "Three Column Layout Box" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "layout-4col",
    name: "4-Column Grid Frame",
    icon: "bi-grid-3x3-gap",
    category: "layout",
    defaultContent: { label: "Four Column Layout Box" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "layout-scroll-x",
    name: "Horizontal Scroll Row",
    icon: "bi-arrow-left-right",
    category: "layout",
    defaultContent: { label: "Swipeable Card Row" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },

  // ==================== Category: MEDIA (16 items) ====================
  {
    type: "media-video",
    name: "HTML5 Video Player",
    icon: "bi-play-btn",
    category: "media",
    defaultContent: { videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", controls: true },
    defaultStyles: { width: "100%", height: "300px", borderRadius: "10px" }
  },
  {
    type: "media-gallery",
    name: "Interactive Photo Gallery",
    icon: "bi-images",
    category: "media",
    defaultContent: { images: [
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=400",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400"
    ] },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "media-lottie",
    name: "Lottie Animation Box",
    icon: "bi-magic",
    category: "media",
    defaultContent: { animationUrl: "https://assets5.lottiefiles.com/packages/lf20_tiv1g2eq.json", loop: true },
    defaultStyles: { width: "200px", height: "200px", marginTop: "10px", marginBottom: "10px" }
  },
  {
    type: "media-audio",
    name: "Audio Player Bar",
    icon: "bi-volume-up",
    category: "media",
    defaultContent: { audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", title: "Principal Speech Message" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "media-pdf",
    name: "PDF Document Viewer",
    icon: "bi-file-pdf",
    category: "media",
    defaultContent: { pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", height: "450px" },
    defaultStyles: { width: "100%", borderRadius: "8px" }
  },
  {
    type: "media-svg",
    name: "Custom SVG drawing Box",
    icon: "bi-code",
    category: "media",
    defaultContent: { svgCode: `<svg viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="40" stroke="blue" stroke-width="4" fill="yellow" /></svg>` },
    defaultStyles: { width: "100px", height: "100px" }
  },
  {
    type: "media-comparison",
    name: "Before/After Slider",
    icon: "bi-arrow-left-right",
    category: "media",
    defaultContent: {
      beforeImg: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=400",
      afterImg: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400",
      labelBefore: "Old Campus 2000",
      labelAfter: "New Campus 2026"
    },
    defaultStyles: { width: "100%", height: "300px", borderRadius: "10px" }
  },
  {
    type: "media-progress-circle",
    name: "Circular Progress Circle",
    icon: "bi-circle-half",
    category: "media",
    defaultContent: { percentage: 75, label: "Seats Reserved" },
    defaultStyles: { width: "120px", height: "120px" }
  },
  {
    type: "media-voice",
    name: "Voice Audio Recorder",
    icon: "bi-mic",
    category: "media",
    defaultContent: { prompt: "Record parent inquiry message" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "media-hotspots",
    name: "Image with Hotspots",
    icon: "bi-bullseye",
    category: "media",
    defaultContent: {
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600",
      hotspots: [
        { x: "20%", y: "30%", tooltip: "Science Laboratories Block" },
        { x: "70%", y: "50%", tooltip: "Indoor Sports Arena Turf" }
      ]
    },
    defaultStyles: { width: "100%", height: "350px", borderRadius: "12px" }
  },
  {
    type: "media-youtube",
    name: "YouTube Frame Player",
    icon: "bi-youtube",
    category: "media",
    defaultContent: { videoId: "dQw4w9WgXcQ", height: "315px" },
    defaultStyles: { width: "100%", borderRadius: "8px" }
  },
  {
    type: "media-vimeo",
    name: "Vimeo Frame Player",
    icon: "bi-vimeo",
    category: "media",
    defaultContent: { videoId: "76979871", height: "315px" },
    defaultStyles: { width: "100%", borderRadius: "8px" }
  },
  {
    type: "media-gmaps",
    name: "Google Maps Frame",
    icon: "bi-map",
    category: "media",
    defaultContent: { address: "Acme School, Greater Noida, India", height: "250px" },
    defaultStyles: { width: "100%", borderRadius: "10px" }
  },
  {
    type: "media-html5-video",
    name: "Video Tag Player",
    icon: "bi-film",
    category: "media",
    defaultContent: { src: "https://www.w3schools.com/html/mov_bbb.mp4", poster: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=300" },
    defaultStyles: { width: "100%", height: "auto" }
  },
  {
    type: "media-icon-array",
    name: "Interactive Icon Grid",
    icon: "bi-grid-fill",
    category: "media",
    defaultContent: { icons: ["bi-cpu", "bi-globe", "bi-trophy", "bi-award", "bi-book", "bi-camera"] },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "media-slideshow",
    name: "Auto Photos Slideshow",
    icon: "bi-file-slides",
    category: "media",
    defaultContent: { images: [
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=400",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=400"
    ], interval: 3000 },
    defaultStyles: { width: "100%", height: "250px", borderRadius: "10px" }
  },

  // ==================== Category: INTERACTIVE (16 items) ====================
  {
    type: "social-icons",
    name: "Social Media Links",
    icon: "bi-share",
    category: "interactive",
    defaultContent: { facebook: "https://facebook.com", instagram: "https://instagram.com", linkedin: "https://linkedin.com", whatsapp: "https://wa.me/919012559012", twitter: "https://twitter.com", iconSize: "24px", iconColor: "#475569", align: "center" },
    defaultStyles: { width: "100%", height: "auto", paddingTop: "15px", paddingBottom: "15px", paddingLeft: "0px", paddingRight: "0px", marginTop: "0px", marginBottom: "0px" }
  },
  {
    type: "interactive-whatsapp",
    name: "WhatsApp Widget Button",
    icon: "bi-whatsapp",
    category: "interactive",
    defaultContent: { phone: "+919012559012", message: "Hi! I am looking for admission inquiry details.", label: "WhatsApp Support" },
    defaultStyles: { width: "auto", backgroundColor: "#25D366", textColor: "#ffffff", borderRadius: "30px", paddingTop: "10px", paddingBottom: "10px", paddingLeft: "20px", paddingRight: "20px" }
  },
  {
    type: "interactive-fab",
    name: "Floating Action FAB",
    icon: "bi-plus-circle-fill",
    category: "interactive",
    defaultContent: { label: "Contact Us Now", iconClass: "bi-telephone" },
    defaultStyles: { width: "50px", height: "50px", backgroundColor: "#2249b7", textColor: "#ffffff", borderRadius: "50%" }
  },
  {
    type: "interactive-cta",
    name: "CTA Fast Link Button",
    icon: "bi-lightning",
    category: "interactive",
    defaultContent: { text: "Register Admissions Online", url: "#contact-form" },
    defaultStyles: { width: "100%", backgroundColor: "#e11d48", textColor: "#ffffff", borderRadius: "8px", paddingTop: "12px", paddingBottom: "12px" }
  },
  {
    type: "interactive-top",
    name: "Back to Top Button",
    icon: "bi-arrow-up-circle",
    category: "interactive",
    defaultContent: { label: "Back to Top" },
    defaultStyles: { width: "auto", backgroundColor: "#334155", textColor: "#ffffff", borderRadius: "6px" }
  },
  {
    type: "interactive-copy",
    name: "Clipboard Copy Box",
    icon: "bi-clipboard",
    category: "interactive",
    defaultContent: { textToCopy: "ACME2026ADMIT", label: "Copy Referral Promo Code" },
    defaultStyles: { width: "100%", backgroundColor: "#f1f5f9", textColor: "#334155", paddingLeft: "15px", paddingRight: "15px" }
  },
  {
    type: "interactive-share",
    name: "Native OS Web Share",
    icon: "bi-share-fill",
    category: "interactive",
    defaultContent: { title: "Admissions Open | Acme Academy", text: "Admissions are now open for academic session 2026. Apply now!", url: "http://localhost:5000" },
    defaultStyles: { width: "auto", backgroundColor: "#4f46e5", textColor: "#ffffff" }
  },
  {
    type: "interactive-theme",
    name: "Dark/Light Toggle",
    icon: "bi-brightness-high",
    category: "interactive",
    defaultContent: { label: "Switch Theme Mode" },
    defaultStyles: { width: "auto", paddingTop: "5px", paddingBottom: "5px" }
  },
  {
    type: "interactive-mic",
    name: "Speech Microphone Trigger",
    icon: "bi-mic-fill",
    category: "interactive",
    defaultContent: { label: "Tap to record vocal inquiry" },
    defaultStyles: { width: "auto", backgroundColor: "#ef4444", textColor: "#ffffff" }
  },
  {
    type: "interactive-call",
    name: "Direct Call Dialer Button",
    icon: "bi-telephone-outbound",
    category: "interactive",
    defaultContent: { phone: "+919012559012", text: "Click to Call Office" },
    defaultStyles: { width: "auto", backgroundColor: "#059669", textColor: "#ffffff" }
  },
  {
    type: "interactive-email",
    name: "Direct Email Mailto Button",
    icon: "bi-envelope-at",
    category: "interactive",
    defaultContent: { email: "helpdesk@clarwyn.edu", text: "Mail Admissions Helpdesk" },
    defaultStyles: { width: "auto", backgroundColor: "#4b5563", textColor: "#ffffff" }
  },
  {
    type: "interactive-js",
    name: "Custom JS Function Run",
    icon: "bi-braces",
    category: "interactive",
    defaultContent: { label: "Run JS Trigger Button", jsCode: "alert('Callback executed successfully.');" },
    defaultStyles: { width: "auto", backgroundColor: "#d97706", textColor: "#ffffff" }
  },
  {
    type: "interactive-search",
    name: "Live Page Search Bar",
    icon: "bi-search",
    category: "interactive",
    defaultContent: { placeholder: "Search courses & programs..." },
    defaultStyles: { width: "100%", borderRadius: "8px" }
  },
  {
    type: "interactive-pin",
    name: "Interactive Map Pin Link",
    icon: "bi-pin-angle",
    category: "interactive",
    defaultContent: { label: "Locate Campus on Google Maps", url: "https://maps.google.com" },
    defaultStyles: { width: "auto", textColor: "#ef4444" }
  },
  {
    type: "interactive-download",
    name: "Download File Trigger",
    icon: "bi-download",
    category: "interactive",
    defaultContent: { label: "Download Fee Structure PDF", fileUrl: "#" },
    defaultStyles: { width: "auto", backgroundColor: "#0284c7", textColor: "#ffffff" }
  },
  {
    type: "interactive-modal",
    name: "Modal Trigger Dialog",
    icon: "bi-window",
    category: "interactive",
    defaultContent: { buttonText: "View Eligibility Rules", modalTitle: "Criteria Guidelines", modalBody: "Applicants must possess primary education certificates from recognized boards." },
    defaultStyles: { width: "auto", backgroundColor: "#8b5cf6", textColor: "#ffffff" }
  },

  // ==================== Category: ADVANCED (16 items) ====================
  {
    type: "form-container",
    name: "Enquiry Form Block",
    icon: "bi-file-earmark-spreadsheet",
    category: "advanced",
    defaultContent: { title: "Get In Touch", subtitle: "Select one of your pre-built Enquiry Forms below", formType: "enquiry_form", enquiryFormId: "", submitButtonText: "Submit", submitButtonColor: "#2249b7" },
    defaultStyles: { width: "100%", height: "auto", paddingTop: "40px", paddingBottom: "40px", paddingLeft: "30px", paddingRight: "30px", marginTop: "10px", marginBottom: "10px", backgroundColor: "#ffffff", textColor: "#0f172a", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)" }
  },
  {
    type: "payment-form",
    name: "Secure Payment Checkout",
    icon: "bi-credit-card-2-front",
    category: "advanced",
    defaultContent: { title: "Enrollment Deposit Fees", subtitle: "Complete your secure billing process to reserve seat", priceText: "$250.00", itemName: "Admissions Reservation Deposit", buttonText: "Proceed Secure Payment" },
    defaultStyles: { width: "100%", height: "auto", paddingTop: "40px", paddingBottom: "40px", paddingLeft: "30px", paddingRight: "30px", marginTop: "10px", marginBottom: "10px", backgroundColor: "#ffffff", textColor: "#0f172a", borderRadius: "16px", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)" }
  },
  {
    type: "iframe",
    name: "Iframe Embed Form",
    icon: "bi-code-square",
    category: "advanced",
    defaultContent: { iframeUrl: "https://clarwyn.simplyadmission.com/common/customizedRegistrationForm/Mg==", height: "600px", width: "100%" },
    defaultStyles: { width: "100%", height: "auto", paddingTop: "15px", paddingBottom: "15px", paddingLeft: "0px", paddingRight: "0px", marginTop: "0px", marginBottom: "0px" }
  },
  {
    type: "advanced-counter",
    name: "Numerical Counter",
    icon: "bi-calculator",
    category: "advanced",
    defaultContent: { targetNumber: "1250", suffix: "+", title: "Enrolled Students" },
    defaultStyles: { width: "100%", paddingTop: "15px", paddingBottom: "15px" }
  },
  {
    type: "advanced-progress",
    name: "Linear Progress Bar",
    icon: "bi-bar-chart-steps",
    category: "advanced",
    defaultContent: { percent: 70, label: "Admissions Target Achieved" },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "advanced-countdown",
    name: "Date Countdown Clock",
    icon: "bi-hourglass-split",
    category: "advanced",
    defaultContent: { deadlineDate: "2026-08-31T23:59:59", label: "Registration Deadline Closes In:" },
    defaultStyles: { width: "100%", backgroundColor: "#f8fafc", paddingTop: "20px", paddingBottom: "20px" }
  },
  {
    type: "advanced-map",
    name: "OpenStreetMap Embed",
    icon: "bi-map-fill",
    category: "advanced",
    defaultContent: { lat: 28.6139, lng: 77.209, zoom: 13 },
    defaultStyles: { width: "100%", height: "300px", borderRadius: "12px" }
  },
  {
    type: "advanced-html",
    name: "HTML Code Sandbox",
    icon: "bi-filetype-html",
    category: "advanced",
    defaultContent: { htmlCode: `<div class="p-3 bg-light border border-success rounded text-center"><h6>Dynamic Raw HTML Block</h6><p class="mb-0">Parsed correctly.</p></div>` },
    defaultStyles: { width: "100%", paddingTop: "10px", paddingBottom: "10px" }
  },
  {
    type: "advanced-timeline",
    name: "Timeline Tracker Grid",
    icon: "bi-bezier2",
    category: "advanced",
    defaultContent: { title: "Milestones Plan", steps: ["Inquiry Submission", "Academic Verification", "Fees Payment", "Final Confirmation"] },
    defaultStyles: { width: "100%", paddingTop: "20px", paddingBottom: "20px" }
  },
  {
    type: "advanced-pie-chart",
    name: "SVG Pie Chart Widget",
    icon: "bi-pie-chart",
    category: "advanced",
    defaultContent: { title: "Placement Sectors", data: "Tech: 40%, Biotech: 30%, Finance: 20%, Core: 10%" },
    defaultStyles: { width: "100%", paddingTop: "20px", paddingBottom: "20px" }
  },
  {
    type: "advanced-bar-chart",
    name: "SVG Bar Chart Widget",
    icon: "bi-graph-up-arrow",
    category: "advanced",
    defaultContent: { title: "Student Intake Growth (Years)", labels: "2023, 2024, 2025, 2026", values: "350, 480, 690, 1100" },
    defaultStyles: { width: "100%", paddingTop: "20px", paddingBottom: "20px" }
  },
  {
    type: "advanced-line-graph",
    name: "SVG Line Graph Widget",
    icon: "bi-graph-down",
    category: "advanced",
    defaultContent: { title: "Performance Ranking Trend", labels: "Term 1, Term 2, Term 3, Finals", values: "72, 85, 81, 93" },
    defaultStyles: { width: "100%", paddingTop: "20px", paddingBottom: "20px" }
  }
];
