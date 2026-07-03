// 16 Complete Professional Website Templates
// Each includes: multiple pages, header, footer, complete design system
// Categories: Company, Hotel, Portfolio, Restaurant, School

export const COMPLETE_WEBSITE_TEMPLATES = [
  // ========== COMPANY WEBSITES ==========
  {
    id: "company-consulting",
    name: "Apex Consulting",
    category: "Company",
    subcategory: "Consulting",
    description: "Professional consulting firm with services, portfolio, and contact pages",
    thumbnail: "https://picsum.photos/seed/company-consulting/600/360",
    preview: "https://picsum.photos/seed/company-consulting-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Apex Consulting", sections: [{ type: "hero" }, { type: "features" }, { type: "stats" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Services", type: "services", title: "What We Offer" },
      { name: "About", type: "about", title: "About Us" },
      { name: "Contact", type: "contact", title: "Get in Touch" }
    ],
    colors: { primary: "#1d4ed8", secondary: "#f3f4f6", accent: "#dc2626" },
    features: ["Multi-page", "Professional Design", "Contact Form", "Testimonials", "Services Showcase"]
  },
  {
    id: "company-creative-agency",
    name: "Creative Studio",
    category: "Company",
    subcategory: "Creative Agency",
    description: "Design and digital marketing agency with portfolio showcase",
    thumbnail: "https://picsum.photos/seed/company-creative/600/360",
    preview: "https://picsum.photos/seed/company-creative-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Creative Studio", sections: [{ type: "hero" }, { type: "portfolio" }, { type: "services" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Portfolio", type: "portfolio", title: "Our Work" },
      { name: "Services", type: "services", title: "Services" },
      { name: "Contact", type: "contact", title: "Contact Us" }
    ],
    colors: { primary: "#7c3aed", secondary: "#f3f4f6", accent: "#ec4899" },
    features: ["Portfolio Showcase", "Case Studies", "Service Descriptions", "Client Testimonials"]
  },
  {
    id: "company-law-firm",
    name: "Legal Associates",
    category: "Company",
    subcategory: "Law Firm",
    description: "Professional law firm with practice areas and attorney profiles",
    thumbnail: "https://picsum.photos/seed/company-law/600/360",
    preview: "https://picsum.photos/seed/company-law-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Legal Associates", sections: [{ type: "hero" }, { type: "services" }, { type: "team" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Practice Areas", type: "services", title: "Practice Areas" },
      { name: "Team", type: "team", title: "Our Attorneys" },
      { name: "Contact", type: "contact", title: "Contact" }
    ],
    colors: { primary: "#1f2937", secondary: "#f3f4f6", accent: "#0d9488" },
    features: ["Attorney Profiles", "Practice Areas", "Client Testimonials", "Consultation Request"]
  },
  {
    id: "company-finance-group",
    name: "Financial Advisors",
    category: "Company",
    subcategory: "Finance",
    description: "Financial services company with investment solutions",
    thumbnail: "https://picsum.photos/seed/company-finance/600/360",
    preview: "https://picsum.photos/seed/company-finance-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Financial Advisors", sections: [{ type: "hero" }, { type: "services" }, { type: "stats" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Services", type: "services", title: "Financial Services" },
      { name: "About", type: "about", title: "About Us" },
      { name: "Contact", type: "contact", title: "Contact" }
    ],
    colors: { primary: "#0891b2", secondary: "#f3f4f6", accent: "#fbbf24" },
    features: ["Investment Solutions", "Financial Planning", "Client Testimonials", "Secure Contact"]
  },
  {
    id: "company-health-clinic",
    name: "Health Plus Clinic",
    category: "Company",
    subcategory: "Healthcare",
    description: "Medical clinic with services, doctor profiles, and appointment booking",
    thumbnail: "https://picsum.photos/seed/company-health/600/360",
    preview: "https://picsum.photos/seed/company-health-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Health Plus Clinic", sections: [{ type: "hero" }, { type: "services" }, { type: "team" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Services", type: "services", title: "Medical Services" },
      { name: "Doctors", type: "team", title: "Our Team" },
      { name: "Contact", type: "contact", title: "Contact" }
    ],
    colors: { primary: "#059669", secondary: "#f3f4f6", accent: "#dc2626" },
    features: ["Doctor Profiles", "Service Information", "Appointment Booking", "Patient Testimonials"]
  },
  {
    id: "company-real-estate",
    name: "Premium Properties",
    category: "Company",
    subcategory: "Real Estate",
    description: "Real estate agency with property listings and search",
    thumbnail: "https://picsum.photos/seed/company-realestate/600/360",
    preview: "https://picsum.photos/seed/company-realestate-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Premium Properties", sections: [{ type: "hero" }, { type: "gallery" }, { type: "stats" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Listings", type: "portfolio", title: "Properties" },
      { name: "About", type: "about", title: "About Us" },
      { name: "Contact", type: "contact", title: "Contact" }
    ],
    colors: { primary: "#dc2626", secondary: "#f3f4f6", accent: "#3b82f6" },
    features: ["Property Listings", "Advanced Search", "Property Details", "Agent Information"]
  },
  {
    id: "company-manufacturing",
    name: "Industrial Solutions",
    category: "Company",
    subcategory: "Manufacturing",
    description: "Manufacturing company with product catalog and technical specs",
    thumbnail: "https://picsum.photos/seed/company-manufacturing/600/360",
    preview: "https://picsum.photos/seed/company-manufacturing-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Industrial Solutions", sections: [{ type: "hero" }, { type: "portfolio" }, { type: "services" }, { type: "stats" }, { type: "cta" }] },
      { name: "Products", type: "portfolio", title: "Product Catalog" },
      { name: "Services", type: "services", title: "Services" },
      { name: "Contact", type: "contact", title: "Contact" }
    ],
    colors: { primary: "#6366f1", secondary: "#f3f4f6", accent: "#10b981" },
    features: ["Product Catalog", "Technical Specifications", "Service Information", "Quote Request"]
  },
  {
    id: "company-nonprofit",
    name: "Hope Foundation",
    category: "Company",
    subcategory: "Non-Profit",
    description: "Non-profit organization with mission, programs, and donation options",
    thumbnail: "https://picsum.photos/seed/company-nonprofit/600/360",
    preview: "https://picsum.photos/seed/company-nonprofit-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Hope Foundation", sections: [{ type: "hero" }, { type: "services" }, { type: "stats" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Programs", type: "portfolio", title: "Our Programs" },
      { name: "Impact", type: "about", title: "Our Impact" },
      { name: "Donate", type: "contact", title: "Support Us" }
    ],
    colors: { primary: "#f59e0b", secondary: "#f3f4f6", accent: "#10b981" },
    features: ["Program Showcase", "Impact Stories", "Donation Integration", "Volunteer Information"]
  },

  // ========== HOTEL WEBSITES ==========
  {
    id: "hotel-alpine-lodge",
    name: "Alpine Lodge Resort",
    category: "Hotel",
    subcategory: "Luxury Resort",
    description: "Mountain resort with room bookings, amenities, and dining",
    thumbnail: "https://picsum.photos/seed/hotel-alpine/600/360",
    preview: "https://picsum.photos/seed/hotel-alpine-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Alpine Lodge", sections: [{ type: "hero" }, { type: "gallery" }, { type: "services" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Rooms", type: "portfolio", title: "Accommodations" },
      { name: "Dining", type: "services", title: "Restaurants" },
      { name: "Booking", type: "contact", title: "Book Your Stay" }
    ],
    colors: { primary: "#1f2937", secondary: "#f3f4f6", accent: "#3b82f6" },
    features: ["Room Showcase", "Amenities List", "Dining Information", "Online Booking"]
  },
  {
    id: "hotel-santorini-blue",
    name: "Santorini Blue Resort",
    category: "Hotel",
    subcategory: "Beach Resort",
    description: "Scenic coastal resort with beach access and sunset views",
    thumbnail: "https://picsum.photos/seed/hotel-santorini/600/360",
    preview: "https://picsum.photos/seed/hotel-santorini-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Santorini Blue", sections: [{ type: "hero" }, { type: "gallery" }, { type: "services" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Rooms", type: "portfolio", title: "Rooms" },
      { name: "Activities", type: "services", title: "Things to Do" },
      { name: "Contact", type: "contact", title: "Book" }
    ],
    colors: { primary: "#06b6d4", secondary: "#f3f4f6", accent: "#fbbf24" },
    features: ["Photo Gallery", "Room Selection", "Activity Information", "Beach Access Info"]
  },
  {
    id: "hotel-grand-estate",
    name: "Grand Estate Hotel",
    category: "Hotel",
    subcategory: "Luxury Hotel",
    description: "Historic grand hotel with ballrooms and event spaces",
    thumbnail: "https://picsum.photos/seed/hotel-grand/600/360",
    preview: "https://picsum.photos/seed/hotel-grand-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Grand Estate Hotel", sections: [{ type: "hero" }, { type: "gallery" }, { type: "services" }, { type: "stats" }, { type: "cta" }] },
      { name: "Rooms", type: "portfolio", title: "Suites" },
      { name: "Events", type: "services", title: "Events" },
      { name: "Dining", type: "portfolio", title: "Restaurants" }
    ],
    colors: { primary: "#7c2d12", secondary: "#f3f4f6", accent: "#fbbf24" },
    features: ["Suite Gallery", "Event Spaces", "Wedding Services", "Fine Dining"]
  },

  // ========== PORTFOLIO WEBSITES ==========
  {
    id: "portfolio-design-bold",
    name: "Bold Design Studio",
    category: "Portfolio",
    subcategory: "Graphic Design",
    description: "Designer portfolio with project showcase and case studies",
    thumbnail: "https://picsum.photos/seed/portfolio-design/600/360",
    preview: "https://picsum.photos/seed/portfolio-design-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Bold Design Studio", sections: [{ type: "hero" }, { type: "portfolio" }, { type: "services" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Portfolio", type: "portfolio", title: "My Work" },
      { name: "About", type: "about", title: "About Me" },
      { name: "Contact", type: "contact", title: "Get in Touch" }
    ],
    colors: { primary: "#ec4899", secondary: "#f3f4f6", accent: "#8b5cf6" },
    features: ["Project Gallery", "Case Studies", "Process Explanation", "Client Testimonials"]
  },
  {
    id: "portfolio-dev-dark",
    name: "Developer Portfolio",
    category: "Portfolio",
    subcategory: "Web Development",
    description: "Developer portfolio with code samples and project links",
    thumbnail: "https://picsum.photos/seed/portfolio-dev/600/360",
    preview: "https://picsum.photos/seed/portfolio-dev-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Web Developer", sections: [{ type: "hero" }, { type: "portfolio" }, { type: "services" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Projects", type: "portfolio", title: "Projects" },
      { name: "Blog", type: "about", title: "Articles" },
      { name: "Contact", type: "contact", title: "Hire Me" }
    ],
    colors: { primary: "#3b82f6", secondary: "#1f2937", accent: "#10b981" },
    features: ["Code Samples", "GitHub Links", "Live Demos", "Blog Articles"]
  },
  {
    id: "portfolio-photo-minimal",
    name: "Photography Minimal",
    category: "Portfolio",
    subcategory: "Photography",
    description: "Photographer portfolio with gallery and booking",
    thumbnail: "https://picsum.photos/seed/portfolio-photo/600/360",
    preview: "https://picsum.photos/seed/portfolio-photo-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Photography", sections: [{ type: "hero" }, { type: "gallery" }, { type: "services" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Gallery", type: "portfolio", title: "Portfolio" },
      { name: "Services", type: "services", title: "Services" },
      { name: "Booking", type: "contact", title: "Book" }
    ],
    colors: { primary: "#1f2937", secondary: "#f3f4f6", accent: "#ec4899" },
    features: ["Photo Gallery", "Service Packages", "Pricing", "Booking System"]
  },

  // ========== RESTAURANT WEBSITES ==========
  {
    id: "restaurant-bella-italia",
    name: "Bella Italia",
    category: "Restaurant",
    subcategory: "Italian Restaurant",
    description: "Italian restaurant with menu, reservations, and dining experience",
    thumbnail: "https://picsum.photos/seed/restaurant-bella/600/360",
    preview: "https://picsum.photos/seed/restaurant-bella-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Bella Italia", sections: [{ type: "hero" }, { type: "gallery" }, { type: "services" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Menu", type: "portfolio", title: "Menu" },
      { name: "About", type: "about", title: "Our Story" },
      { name: "Reservations", type: "contact", title: "Reserve" }
    ],
    colors: { primary: "#dc2626", secondary: "#f3f4f6", accent: "#10b981" },
    features: ["Digital Menu", "Food Photography", "Reservation System", "Review Section"]
  },
  {
    id: "restaurant-sakura-sushi",
    name: "Sakura Sushi",
    category: "Restaurant",
    subcategory: "Sushi Restaurant",
    description: "Sushi restaurant with menu, chef profiles, and delivery info",
    thumbnail: "https://picsum.photos/seed/restaurant-sakura/600/360",
    preview: "https://picsum.photos/seed/restaurant-sakura-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Sakura Sushi", sections: [{ type: "hero" }, { type: "gallery" }, { type: "services" }, { type: "team" }, { type: "cta" }] },
      { name: "Menu", type: "portfolio", title: "Menu" },
      { name: "Team", type: "team", title: "Chefs" },
      { name: "Order", type: "contact", title: "Order" }
    ],
    colors: { primary: "#1f2937", secondary: "#f3f4f6", accent: "#ef4444" },
    features: ["Digital Menu", "Chef Information", "Photo Gallery", "Online Ordering"]
  },
  {
    id: "restaurant-wine-cellar",
    name: "Wine Cellar",
    category: "Restaurant",
    subcategory: "Wine Bar",
    description: "Wine bar and restaurant with wine list and tastings",
    thumbnail: "https://picsum.photos/seed/restaurant-wine/600/360",
    preview: "https://picsum.photos/seed/restaurant-wine-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Wine Cellar", sections: [{ type: "hero" }, { type: "gallery" }, { type: "services" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Menu", type: "portfolio", title: "Menu" },
      { name: "Wines", type: "portfolio", title: "Wine List" },
      { name: "Tastings", type: "services", title: "Wine Tastings" }
    ],
    colors: { primary: "#7c2d12", secondary: "#f3f4f6", accent: "#8b5cf6" },
    features: ["Wine List", "Food Pairings", "Tasting Events", "Reservation System"]
  },

  // ========== SCHOOL WEBSITES ==========
  {
    id: "school-arts-conservatory",
    name: "Arts Conservatory",
    category: "School",
    subcategory: "Arts School",
    description: "Music and arts school with courses, faculty, and admissions",
    thumbnail: "https://picsum.photos/seed/school-arts/600/360",
    preview: "https://picsum.photos/seed/school-arts-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Arts Conservatory", sections: [{ type: "hero" }, { type: "services" }, { type: "team" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Programs", type: "services", title: "Programs" },
      { name: "Faculty", type: "team", title: "Our Teachers" },
      { name: "Admissions", type: "contact", title: "Apply" }
    ],
    colors: { primary: "#ec4899", secondary: "#f3f4f6", accent: "#fbbf24" },
    features: ["Program Descriptions", "Faculty Profiles", "Student Performances", "Admission Info"]
  },
  {
    id: "school-tech-institute",
    name: "Tech Institute",
    category: "School",
    subcategory: "Tech School",
    description: "Technology and coding school with bootcamps and courses",
    thumbnail: "https://picsum.photos/seed/school-tech/600/360",
    preview: "https://picsum.photos/seed/school-tech-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Tech Institute", sections: [{ type: "hero" }, { type: "services" }, { type: "stats" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Courses", type: "portfolio", title: "Bootcamps" },
      { name: "About", type: "about", title: "About" },
      { name: "Enrollment", type: "contact", title: "Enroll" }
    ],
    colors: { primary: "#3b82f6", secondary: "#f3f4f6", accent: "#10b981" },
    features: ["Course Catalog", "Bootcamp Information", "Job Placement Stats", "Student Testimonials"]
  },
  {
    id: "school-ivy-academy",
    name: "Ivy Academy",
    category: "School",
    subcategory: "Private School",
    description: "Premier private academy with academics, sports, and admissions",
    thumbnail: "https://picsum.photos/seed/school-ivy/600/360",
    preview: "https://picsum.photos/seed/school-ivy-preview/1200/800",
    pages: [
      { name: "Home", type: "home", title: "Ivy Academy", sections: [{ type: "hero" }, { type: "services" }, { type: "gallery" }, { type: "testimonials" }, { type: "cta" }] },
      { name: "Academics", type: "services", title: "Programs" },
      { name: "About", type: "about", title: "About Us" },
      { name: "Admissions", type: "contact", title: "Admissions" }
    ],
    colors: { primary: "#1e40af", secondary: "#f3f4f6", accent: "#10b981" },
    features: ["Academic Programs", "Sports Facilities", "Student Life", "Admissions Process"]
  }
];

export const COMPLETE_WEBSITE_MAP = Object.fromEntries(
  COMPLETE_WEBSITE_TEMPLATES.map((t) => [t.id, t])
);

export const TEMPLATE_CATEGORIES = [
  "Company",
  "Hotel",
  "Portfolio",
  "Restaurant",
  "School"
];
