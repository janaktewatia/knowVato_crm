// 50+ Professional Website Templates
// Each template = { key, name, category, accent, thumbnail, blocks[] }

const img = (s, w = 800, h = 400) => `https://picsum.photos/seed/${s}/${w}/${h}`;

const heroBlock = (title, eyebrow, subtitle, bg, buttonText = "Get Started") => ({
  type: "hero",
  props: { eyebrow, title, subtitle, buttonText, buttonLink: "#", bg }
});

const featuresBlock = (items) => ({
  type: "features",
  props: { cols: 3, items }
});

const ctaBlock = (title, subtitle, buttonText = "Get Started") => ({
  type: "cta",
  props: { title, subtitle, buttonText, buttonLink: "#" }
});

const statsBlock = (items) => ({
  type: "stats",
  props: { items }
});

const sectionHeadingBlock = (eyebrow, title, subtitle) => ({
  type: "sectionHeading",
  props: { eyebrow, title, subtitle }
});

export const TEMPLATES_50 = [
  // ========== COMPANY / CORPORATE ==========
  {
    key: "company-consulting",
    name: "Consulting Firm",
    category: "Business",
    accent: "#1d4ed8",
    thumbnail: img("consulting", 600, 360),
    blocks: [
      heroBlock("Strategic Business Consulting", "EXPERT ADVISORS", "Transform your business with data-driven strategies", "linear-gradient(135deg,#1d4ed8,#0b1f5c)"),
      sectionHeadingBlock("OUR SERVICES", "What We Offer", "Comprehensive consulting across all industries"),
      featuresBlock([
        { icon: "bi-briefcase", title: "Strategy", text: "Market analysis and business planning" },
        { icon: "bi-gear-wide-connected", title: "Operations", text: "Process optimization and efficiency" },
        { icon: "bi-graph-up-arrow", title: "Growth", text: "Revenue expansion strategies" },
      ]),
      statsBlock([
        { value: "100+", label: "Clients" },
        { value: "15+", label: "Years" },
        { value: "95%", label: "Success Rate" },
      ]),
      ctaBlock("Ready to Transform?", "Schedule a free consultation with our experts"),
    ],
  },
  {
    key: "company-creative-agency",
    name: "Creative Agency",
    category: "Business",
    accent: "#7c3aed",
    thumbnail: img("creative", 600, 360),
    blocks: [
      heroBlock("Creative Solutions for Your Brand", "DESIGN & DEVELOPMENT", "We turn ideas into remarkable digital experiences", "linear-gradient(135deg,#7c3aed,#3b0764)"),
      sectionHeadingBlock("WHAT WE CREATE", "Our Expertise", "From concept to execution, we deliver excellence"),
      featuresBlock([
        { icon: "bi-palette", title: "Brand Design", text: "Logo, identity, and visual systems" },
        { icon: "bi-code-slash", title: "Web Development", text: "Modern, responsive websites" },
        { icon: "bi-camera", title: "Digital Marketing", text: "Content creation and campaigns" },
      ]),
      ctaBlock("Let's Create Together", "Tell us about your vision"),
    ],
  },
  {
    key: "company-health-clinic",
    name: "Health & Wellness",
    category: "Healthcare",
    accent: "#059669",
    thumbnail: img("health", 600, 360),
    blocks: [
      heroBlock("Your Health, Our Priority", "PATIENT CARE EXCELLENCE", "Comprehensive medical services with compassion", "linear-gradient(135deg,#059669,#064e3b)"),
      sectionHeadingBlock("OUR SERVICES", "Comprehensive Care", "State-of-the-art facilities and expert doctors"),
      featuresBlock([
        { icon: "bi-heart-pulse", title: "Primary Care", text: "Family medicine and wellness" },
        { icon: "bi-bandaid", title: "Specialist Care", text: "Cardiology, orthopedics, pediatrics" },
        { icon: "bi-capsule", title: "Pharmacy", text: "Full-service prescription pharmacy" },
      ]),
      ctaBlock("Schedule Your Appointment", "We're here when you need us"),
    ],
  },
  {
    key: "company-law-firm",
    name: "Law Firm",
    category: "Professional",
    accent: "#1f2937",
    thumbnail: img("law", 600, 360),
    blocks: [
      heroBlock("Legal Excellence You Can Trust", "EXPERIENCED ATTORNEYS", "Defending your rights with integrity", "linear-gradient(135deg,#1f2937,#111827)"),
      sectionHeadingBlock("PRACTICE AREAS", "Specialized Legal Services", "Expertise across multiple practice areas"),
      featuresBlock([
        { icon: "bi-shield-check", title: "Corporate Law", text: "Business formation and contracts" },
        { icon: "bi-file-earmark", title: "Litigation", text: "Professional dispute resolution" },
        { icon: "bi-people", title: "Family Law", text: "Compassionate family matters" },
      ]),
      ctaBlock("Get Your Free Consultation", "Schedule with our experienced team"),
    ],
  },
  {
    key: "company-real-estate",
    name: "Real Estate Agency",
    category: "Business",
    accent: "#dc2626",
    thumbnail: img("realestate", 600, 360),
    blocks: [
      heroBlock("Find Your Dream Home", "PREMIUM PROPERTIES", "Connecting buyers and sellers since 1995", "linear-gradient(135deg,#dc2626,#7f1d1d)"),
      sectionHeadingBlock("WHY CHOOSE US", "Real Estate Excellence", "Professional service and market knowledge"),
      featuresBlock([
        { icon: "bi-house", title: "Residential", text: "Homes in prime locations" },
        { icon: "bi-building", title: "Commercial", text: "Investment opportunities" },
        { icon: "bi-graph-up", title: "Market Insights", text: "Data-driven analysis" },
      ]),
      statsBlock([
        { value: "500+", label: "Properties Sold" },
        { value: "$2B+", label: "Total Volume" },
        { value: "98%", label: "Client Satisfaction" },
      ]),
      ctaBlock("Browse Our Listings", "Find your perfect property"),
    ],
  },
  {
    key: "company-finance-group",
    name: "Financial Services",
    category: "Finance",
    accent: "#0891b2",
    thumbnail: img("finance", 600, 360),
    blocks: [
      heroBlock("Grow Your Wealth", "TRUSTED ADVISORS", "Professional financial guidance for your future", "linear-gradient(135deg,#0891b2,#083344)"),
      sectionHeadingBlock("OUR SERVICES", "Comprehensive Financial Solutions", "Planning, investing, and wealth management"),
      featuresBlock([
        { icon: "bi-piggy-bank", title: "Wealth Management", text: "Personalized investment strategies" },
        { icon: "bi-credit-card", title: "Lending", text: "Flexible loan products" },
        { icon: "bi-graph-up-arrow", title: "Planning", text: "Retirement and education planning" },
      ]),
      ctaBlock("Start Your Journey", "Schedule a consultation today"),
    ],
  },
  {
    key: "company-nonprofit",
    name: "Non-Profit Organization",
    category: "Non-Profit",
    accent: "#f59e0b",
    thumbnail: img("nonprofit", 600, 360),
    blocks: [
      heroBlock("Making a Difference Together", "COMMUNITY IMPACT", "Building a better future for all", "linear-gradient(135deg,#f59e0b,#92400e)"),
      sectionHeadingBlock("OUR MISSION", "Creating Positive Change", "Community programs that transform lives"),
      featuresBlock([
        { icon: "bi-book", title: "Education", text: "Scholarships and learning programs" },
        { icon: "bi-heart", title: "Health", text: "Healthcare and wellness initiatives" },
        { icon: "bi-people-fill", title: "Community", text: "Local development projects" },
      ]),
      statsBlock([
        { value: "10K+", label: "Lives Impacted" },
        { value: "25+", label: "Programs" },
        { value: "100+", label: "Partners" },
      ]),
      ctaBlock("Get Involved", "Join our mission to create change"),
    ],
  },
  {
    key: "company-manufacturing",
    name: "Manufacturing Co.",
    category: "Industrial",
    accent: "#6366f1",
    thumbnail: img("manufacturing", 600, 360),
    blocks: [
      heroBlock("Quality Manufacturing Solutions", "INDUSTRY LEADERS", "Precision engineering since 1985", "linear-gradient(135deg,#6366f1,#312e81)"),
      sectionHeadingBlock("CAPABILITIES", "Advanced Manufacturing", "State-of-the-art production facilities"),
      featuresBlock([
        { icon: "bi-gear", title: "Production", text: "High-volume manufacturing" },
        { icon: "bi-tools", title: "Custom Solutions", text: "Bespoke manufacturing services" },
        { icon: "bi-shield-check", title: "Quality Control", text: "ISO certified processes" },
      ]),
      ctaBlock("Request a Quote", "Let's build something great together"),
    ],
  },

  // ========== HOTELS & HOSPITALITY ==========
  {
    key: "hotel-luxury-resort",
    name: "Luxury Resort",
    category: "Hospitality",
    accent: "#1f2937",
    thumbnail: img("resort", 600, 360),
    blocks: [
      heroBlock("Experience Pure Luxury", "5-STAR RESORT", "Your ultimate destination for relaxation and adventure", "linear-gradient(135deg,#1f2937,#111827)"),
      sectionHeadingBlock("WORLD-CLASS AMENITIES", "Our Facilities", "Everything for an unforgettable stay"),
      featuresBlock([
        { icon: "bi-cup-hot", title: "Fine Dining", text: "Michelin-starred restaurants" },
        { icon: "bi-gem", title: "Spa & Wellness", text: "Premium spa and fitness facilities" },
        { icon: "bi-geo-alt", title: "Activities", text: "Water sports, hiking, and more" },
      ]),
      statsBlock([
        { value: "150", label: "Rooms" },
        { value: "5★", label: "Rating" },
        { value: "50+", label: "Amenities" },
      ]),
      ctaBlock("Book Your Stay", "Experience luxury at its finest"),
    ],
  },
  {
    key: "hotel-boutique",
    name: "Boutique Hotel",
    category: "Hospitality",
    accent: "#9333ea",
    thumbnail: img("boutique", 600, 360),
    blocks: [
      heroBlock("Intimate & Elegant", "BOUTIQUE HOTEL", "Where every guest is treasured", "linear-gradient(135deg,#9333ea,#581c87)"),
      sectionHeadingBlock("UNIQUE EXPERIENCE", "Our Story", "Personalized service in a charming setting"),
      featuresBlock([
        { icon: "bi-heart", title: "Personal Service", text: "Dedicated guest attention" },
        { icon: "bi-art", title: "Design", text: "Artistic, curated ambiance" },
        { icon: "bi-cup-straw", title: "Local Flavors", text: "Farm-to-table cuisine" },
      ]),
      ctaBlock("Reserve a Room", "Join our community of guests"),
    ],
  },
  {
    key: "hotel-business",
    name: "Business Hotel",
    category: "Hospitality",
    accent: "#0284c7",
    thumbnail: img("business-hotel", 600, 360),
    blocks: [
      heroBlock("Business Made Easy", "CORPORATE ACCOMMODATIONS", "Perfect for business travelers", "linear-gradient(135deg,#0284c7,#0c2d57)"),
      sectionHeadingBlock("FOR BUSINESS", "Meeting Your Needs", "Conference facilities and business services"),
      featuresBlock([
        { icon: "bi-wifi", title: "High-Speed Internet", text: "Reliable connectivity" },
        { icon: "bi-briefcase", title: "Meeting Rooms", text: "Equipped conference facilities" },
        { icon: "bi-clock", title: "24/7 Service", text: "Round-the-clock support" },
      ]),
      ctaBlock("Book Your Room", "Convenient and comfortable stays"),
    ],
  },

  // ========== PORTFOLIO / CREATIVE ==========
  {
    key: "portfolio-designer",
    name: "Designer Portfolio",
    category: "Creative",
    accent: "#ec4899",
    thumbnail: img("portfolio-design", 600, 360),
    blocks: [
      heroBlock("Design Excellence", "CREATIVE DIRECTOR", "Award-winning design work", "linear-gradient(135deg,#ec4899,#831843)"),
      sectionHeadingBlock("PORTFOLIO", "Selected Works", "Featured projects and case studies"),
      featuresBlock([
        { icon: "bi-palette", title: "Branding", text: "Logo and identity design" },
        { icon: "bi-layout-wtf", title: "UI/UX", text: "Digital product design" },
        { icon: "bi-image", title: "Visual Design", text: "Art direction and illustration" },
      ]),
      ctaBlock("Work With Me", "Let's create something beautiful"),
    ],
  },
  {
    key: "portfolio-developer",
    name: "Developer Portfolio",
    category: "Creative",
    accent: "#3b82f6",
    thumbnail: img("portfolio-dev", 600, 360),
    blocks: [
      heroBlock("Full-Stack Developer", "SOFTWARE ENGINEER", "Building the web, one pixel at a time", "linear-gradient(135deg,#3b82f6,#1e3a8a)"),
      sectionHeadingBlock("SKILLS", "Technical Expertise", "Modern technologies and best practices"),
      featuresBlock([
        { icon: "bi-code-slash", title: "Frontend", text: "React, Vue, Angular" },
        { icon: "bi-server", title: "Backend", text: "Node.js, Python, Go" },
        { icon: "bi-database", title: "Databases", text: "SQL, NoSQL, Cloud" },
      ]),
      ctaBlock("Let's Talk", "Open to freelance and full-time roles"),
    ],
  },
  {
    key: "portfolio-photographer",
    name: "Photographer Portfolio",
    category: "Creative",
    accent: "#f97316",
    thumbnail: img("portfolio-photo", 600, 360),
    blocks: [
      heroBlock("Capturing Moments", "PROFESSIONAL PHOTOGRAPHER", "Visual storytelling through the lens", "linear-gradient(135deg,#f97316,#7c2d12)"),
      sectionHeadingBlock("SPECIALTIES", "Photography Services", "Events, portraits, and commercial work"),
      featuresBlock([
        { icon: "bi-camera", title: "Weddings", text: "Romantic wedding moments" },
        { icon: "bi-person", title: "Portraits", text: "Professional headshots" },
        { icon: "bi-building", title: "Commercial", text: "Product and real estate photography" },
      ]),
      ctaBlock("Book a Session", "Let me capture your moments"),
    ],
  },

  // ========== ECOMMERCE ==========
  {
    key: "shop-fashion",
    name: "Fashion Store",
    category: "E-commerce",
    accent: "#ec4899",
    thumbnail: img("fashion", 600, 360),
    blocks: [
      heroBlock("Latest Fashion Trends", "BOUTIQUE FASHION", "Premium clothing and accessories", "linear-gradient(135deg,#ec4899,#831843)"),
      sectionHeadingBlock("NEW COLLECTION", "This Season", "Curated styles for every occasion"),
      featuresBlock([
        { icon: "bi-bag-check", title: "Premium Quality", text: "High-quality materials" },
        { icon: "bi-truck", title: "Fast Shipping", text: "Delivery in 2-3 days" },
        { icon: "bi-arrow-counterclockwise", title: "Easy Returns", text: "30-day return policy" },
      ]),
      ctaBlock("Shop Now", "Discover your style"),
    ],
  },
  {
    key: "shop-electronics",
    name: "Electronics Store",
    category: "E-commerce",
    accent: "#0284c7",
    thumbnail: img("electronics", 600, 360),
    blocks: [
      heroBlock("Latest Tech Gadgets", "ELECTRONICS STORE", "Cutting-edge technology at great prices", "linear-gradient(135deg,#0284c7,#0c2d57)"),
      sectionHeadingBlock("FEATURED", "Best Sellers", "Popular products and exclusive deals"),
      featuresBlock([
        { icon: "bi-lightning-charge", title: "Fast Tech", text: "Latest gadgets and phones" },
        { icon: "bi-tag", title: "Best Prices", text: "Competitive pricing" },
        { icon: "bi-shield-check", title: "Warranty", text: "1-year warranty included" },
      ]),
      ctaBlock("Shop Electronics", "Find your next device"),
    ],
  },

  // ========== EDUCATION & LEARNING ==========
  {
    key: "education-university",
    name: "University",
    category: "Education",
    accent: "#0891b2",
    thumbnail: img("university", 600, 360),
    blocks: [
      heroBlock("Shape Your Future", "EXCELLENCE IN EDUCATION", "Leading university for innovation and learning", "linear-gradient(135deg,#0891b2,#083344)"),
      sectionHeadingBlock("PROGRAMS", "Our Offerings", "World-class education across multiple disciplines"),
      featuresBlock([
        { icon: "bi-book", title: "Undergraduate", text: "4-year degree programs" },
        { icon: "bi-mortarboard", title: "Postgraduate", text: "Master's and doctoral programs" },
        { icon: "bi-people", title: "Research", text: "Cutting-edge research facilities" },
      ]),
      statsBlock([
        { value: "25K+", label: "Students" },
        { value: "500+", label: "Faculty" },
        { value: "95%", label: "Placement" },
      ]),
      ctaBlock("Apply Now", "Start your journey with us"),
    ],
  },
  {
    key: "education-course",
    name: "Online Course Platform",
    category: "Education",
    accent: "#7c3aed",
    thumbnail: img("course", 600, 360),
    blocks: [
      heroBlock("Learn Anything, Anytime", "ONLINE LEARNING", "Expert-led courses for your career growth", "linear-gradient(135deg,#7c3aed,#3b0764)"),
      sectionHeadingBlock("POPULAR COURSES", "Top Picks", "Thousands of students learning daily"),
      featuresBlock([
        { icon: "bi-play-circle", title: "Video Lessons", text: "High-quality video content" },
        { icon: "bi-chat-dots", title: "Live Classes", text: "Interactive learning sessions" },
        { icon: "bi-file-earmark", title: "Certifications", text: "Industry-recognized certificates" },
      ]),
      ctaBlock("Explore Courses", "Find the perfect course for you"),
    ],
  },

  // ========== FOOD & RESTAURANTS ==========
  {
    key: "restaurant-fine-dining",
    name: "Fine Dining Restaurant",
    category: "Food & Beverage",
    accent: "#f59e0b",
    thumbnail: img("restaurant", 600, 360),
    blocks: [
      heroBlock("Culinary Excellence", "FINE DINING", "An unforgettable gastronomic experience", "linear-gradient(135deg,#f59e0b,#92400e)"),
      sectionHeadingBlock("OUR MENU", "Signature Dishes", "Crafted by our award-winning chefs"),
      featuresBlock([
        { icon: "bi-cup-hot", title: "Fine Cuisine", text: "French and Italian specialties" },
        { icon: "bi-wine-glass", title: "Wine Selection", text: "Premium wines from around the world" },
        { icon: "bi-flower1", title: "Ambiance", text: "Elegant and intimate setting" },
      ]),
      ctaBlock("Make a Reservation", "Book your table now"),
    ],
  },
  {
    key: "restaurant-cafe",
    name: "Coffee Shop",
    category: "Food & Beverage",
    accent: "#8b4513",
    thumbnail: img("cafe", 600, 360),
    blocks: [
      heroBlock("Your Daily Brew", "ARTISAN COFFEE SHOP", "Specialty coffee and cozy vibes", "linear-gradient(135deg,#8b4513,#5a2d0c)"),
      sectionHeadingBlock("WHAT WE OFFER", "More Than Just Coffee", "Quality beverages and comfortable spaces"),
      featuresBlock([
        { icon: "bi-cup", title: "Specialty Coffee", text: "Single-origin, specialty blends" },
        { icon: "bi-cookie", title: "Pastries & Snacks", text: "Fresh baked daily" },
        { icon: "bi-wifi", title: "Free WiFi", text: "Work-friendly environment" },
      ]),
      ctaBlock("Visit Us Today", "Find our location"),
    ],
  },

  // ========== FITNESS & WELLNESS ==========
  {
    key: "fitness-gym",
    name: "Fitness Gym",
    category: "Fitness & Wellness",
    accent: "#dc2626",
    thumbnail: img("gym", 600, 360),
    blocks: [
      heroBlock("Transform Your Body", "PREMIUM FITNESS", "State-of-the-art gym and training", "linear-gradient(135deg,#dc2626,#7f1d1d)"),
      sectionHeadingBlock("FACILITIES", "Complete Fitness Solution", "Everything you need to reach your goals"),
      featuresBlock([
        { icon: "bi-dumbbell", title: "Equipment", text: "Modern cardio and strength equipment" },
        { icon: "bi-person", title: "Trainers", text: "Certified personal trainers available" },
        { icon: "bi-fire", title: "Group Classes", text: "Yoga, spinning, CrossFit, and more" },
      ]),
      statsBlock([
        { value: "2K+", label: "Members" },
        { value: "50+", label: "Classes/Month" },
        { value: "24/7", label: "Access" },
      ]),
      ctaBlock("Join Now", "Start your fitness journey"),
    ],
  },
  {
    key: "fitness-yoga",
    name: "Yoga Studio",
    category: "Fitness & Wellness",
    accent: "#10b981",
    thumbnail: img("yoga", 600, 360),
    blocks: [
      heroBlock("Find Your Inner Peace", "YOGA STUDIO", "Mindfulness and wellness for all levels", "linear-gradient(135deg,#10b981,#047857)"),
      sectionHeadingBlock("CLASSES", "Your Wellness Journey", "Various styles and difficulty levels"),
      featuresBlock([
        { icon: "bi-flower1", title: "Hatha Yoga", text: "Traditional yoga practice" },
        { icon: "bi-wind", title: "Vinyasa", text: "Dynamic flow sequences" },
        { icon: "bi-moon", title: "Meditation", text: "Guided mindfulness sessions" },
      ]),
      ctaBlock("Book a Class", "Reserve your mat"),
    ],
  },

  // ========== TRAVEL & TOURISM ==========
  {
    key: "travel-agency",
    name: "Travel Agency",
    category: "Travel & Tourism",
    accent: "#2563eb",
    thumbnail: img("travel", 600, 360),
    blocks: [
      heroBlock("Explore the World", "TRAVEL ADVENTURES", "Curated travel experiences and packages", "linear-gradient(135deg,#2563eb,#1e40af)"),
      sectionHeadingBlock("DESTINATIONS", "Popular Getaways", "Amazing places waiting for you"),
      featuresBlock([
        { icon: "bi-geo-alt", title: "Guided Tours", text: "Expert-led tours around the world" },
        { icon: "bi-airplane", title: "Flights & Hotels", text: "Best deals on bookings" },
        { icon: "bi-passport", title: "Visas & Documents", text: "Complete travel assistance" },
      ]),
      ctaBlock("Plan Your Trip", "Let's plan your adventure"),
    ],
  },

  // ========== AUTOMOTIVE ==========
  {
    key: "auto-dealership",
    name: "Car Dealership",
    category: "Automotive",
    accent: "#ef4444",
    thumbnail: img("cars", 600, 360),
    blocks: [
      heroBlock("Drive Your Dream", "PREMIUM AUTO SALES", "Quality vehicles and exceptional service", "linear-gradient(135deg,#ef4444,#991b1b)"),
      sectionHeadingBlock("INVENTORY", "Featured Vehicles", "Latest models in stock"),
      featuresBlock([
        { icon: "bi-car-front", title: "New Vehicles", text: "Latest models with warranty" },
        { icon: "bi-arrow-repeat", title: "Pre-Owned", text: "Certified pre-owned vehicles" },
        { icon: "bi-tools", title: "Service", text: "Expert maintenance and repair" },
      ]),
      ctaBlock("View Inventory", "Find your perfect car"),
    ],
  },

  // ========== BEAUTY & SALON ==========
  {
    key: "beauty-salon",
    name: "Beauty Salon",
    category: "Beauty & Personal Care",
    accent: "#ec4899",
    thumbnail: img("salon", 600, 360),
    blocks: [
      heroBlock("Enhance Your Beauty", "BEAUTY SALON", "Professional styling and skincare", "linear-gradient(135deg,#ec4899,#831843)"),
      sectionHeadingBlock("SERVICES", "Pamper Yourself", "Complete beauty and wellness solutions"),
      featuresBlock([
        { icon: "bi-scissors", title: "Hair Care", text: "Cutting, coloring, treatments" },
        { icon: "bi-brush", title: "Makeup", text: "Professional makeup services" },
        { icon: "bi-flower1", title: "Skincare", text: "Facials and spa treatments" },
      ]),
      ctaBlock("Book an Appointment", "Reserve your spot"),
    ],
  },

  // ========== REAL ESTATE - ADDITIONAL ==========
  {
    key: "property-rental",
    name: "Vacation Rental",
    category: "Real Estate",
    accent: "#06b6d4",
    thumbnail: img("vacation", 600, 360),
    blocks: [
      heroBlock("Your Perfect Stay Awaits", "VACATION RENTALS", "Unique properties in stunning locations", "linear-gradient(135deg,#06b6d4,#0e7490)"),
      sectionHeadingBlock("FEATURED PROPERTIES", "Dream Getaways", "Hand-picked properties worldwide"),
      featuresBlock([
        { icon: "bi-house", title: "Villas", text: "Luxury villa rentals" },
        { icon: "bi-building", title: "Apartments", text: "Cozy city apartments" },
        { icon: "bi-flower1", title: "Cottages", text: "Countryside retreats" },
      ]),
      ctaBlock("Browse Properties", "Find your ideal rental"),
    ],
  },

  // ========== PROFESSIONAL SERVICES ==========
  {
    key: "services-accounting",
    name: "Accounting Firm",
    category: "Professional Services",
    accent: "#1f2937",
    thumbnail: img("accounting", 600, 360),
    blocks: [
      heroBlock("Your Financial Partner", "ACCOUNTING SERVICES", "Expert financial guidance for businesses", "linear-gradient(135deg,#1f2937,#111827)"),
      sectionHeadingBlock("SERVICES", "What We Offer", "Comprehensive accounting and tax solutions"),
      featuresBlock([
        { icon: "bi-calculator", title: "Accounting", text: "Bookkeeping and financial reporting" },
        { icon: "bi-receipt", title: "Tax Planning", text: "Tax strategy and compliance" },
        { icon: "bi-graph-up", title: "Business Advisory", text: "Strategic business guidance" },
      ]),
      ctaBlock("Schedule Consultation", "Let's discuss your needs"),
    ],
  },
  {
    key: "services-insurance",
    name: "Insurance Agency",
    category: "Professional Services",
    accent: "#0284c7",
    thumbnail: img("insurance", 600, 360),
    blocks: [
      heroBlock("Protect What Matters", "INSURANCE SOLUTIONS", "Comprehensive coverage for peace of mind", "linear-gradient(135deg,#0284c7,#0c2d57)"),
      sectionHeadingBlock("COVERAGE", "Insurance Types", "Tailored policies for every need"),
      featuresBlock([
        { icon: "bi-shield-check", title: "Health Insurance", text: "Comprehensive health coverage" },
        { icon: "bi-car-front", title: "Auto Insurance", text: "Complete vehicle protection" },
        { icon: "bi-house", title: "Home Insurance", text: "Property and liability coverage" },
      ]),
      ctaBlock("Get a Quote", "Protect your family"),
    ],
  },

  // ========== ENTERTAINMENT ==========
  {
    key: "entertainment-cinema",
    name: "Movie Theater",
    category: "Entertainment",
    accent: "#7c3aed",
    thumbnail: img("cinema", 600, 360),
    blocks: [
      heroBlock("Experience Cinema", "PREMIUM CINEMA", "The ultimate movie experience", "linear-gradient(135deg,#7c3aed,#3b0764)"),
      sectionHeadingBlock("NOW SHOWING", "Current Releases", "Latest blockbusters and indie films"),
      featuresBlock([
        { icon: "bi-film", title: "4K Screens", text: "State-of-the-art projection" },
        { icon: "bi-speaker", title: "Dolby Atmos", text: "Immersive sound experience" },
        { icon: "bi-cup-hot", title: "Premium Snacks", text: "Gourmet concessions" },
      ]),
      ctaBlock("Buy Tickets", "Book your seats now"),
    ],
  },

  // ========== SPORTS ==========
  {
    key: "sports-coaching",
    name: "Sports Coaching",
    category: "Sports",
    accent: "#ef4444",
    thumbnail: img("sports", 600, 360),
    blocks: [
      heroBlock("Train Like a Pro", "ELITE COACHING", "Professional sports training programs", "linear-gradient(135deg,#ef4444,#991b1b)"),
      sectionHeadingBlock("PROGRAMS", "Our Offerings", "For athletes of all levels"),
      featuresBlock([
        { icon: "bi-trophy", title: "Coaching", text: "Expert coaches and training" },
        { icon: "bi-graph-up", title: "Performance", text: "Track progress and results" },
        { icon: "bi-people", title: "Community", text: "Join a supportive team" },
      ]),
      ctaBlock("Enroll Now", "Begin your training journey"),
    ],
  },

  // ========== TECHNOLOGY ==========
  {
    key: "tech-saas",
    name: "SaaS Startup",
    category: "Technology",
    accent: "#3b82f6",
    thumbnail: img("saas", 600, 360),
    blocks: [
      heroBlock("Empower Your Business", "SAAS SOLUTION", "Cloud-based software for modern teams", "linear-gradient(135deg,#3b82f6,#1e3a8a)"),
      sectionHeadingBlock("FEATURES", "What's Included", "Everything you need to succeed"),
      featuresBlock([
        { icon: "bi-cloud", title: "Cloud-Based", text: "Access anywhere, anytime" },
        { icon: "bi-shield-check", title: "Secure", text: "Enterprise-grade security" },
        { icon: "bi-people", title: "Collaboration", text: "Team-friendly tools" },
      ]),
      statsBlock([
        { value: "10K+", label: "Users" },
        { value: "99.9%", label: "Uptime" },
        { value: "24/7", label: "Support" },
      ]),
      ctaBlock("Start Free Trial", "Try for 14 days"),
    ],
  },
  {
    key: "tech-startup",
    name: "Tech Startup",
    category: "Technology",
    accent: "#10b981",
    thumbnail: img("startup", 600, 360),
    blocks: [
      heroBlock("Innovation & Impact", "TECH STARTUP", "Disrupting industries with cutting-edge tech", "linear-gradient(135deg,#10b981,#047857)"),
      sectionHeadingBlock("OUR MISSION", "Changing the World", "Building tomorrow's solutions today"),
      featuresBlock([
        { icon: "bi-lightbulb", title: "Innovation", text: "Cutting-edge technology" },
        { icon: "bi-people", title: "Team", text: "Talented engineers and designers" },
        { icon: "bi-target", title: "Vision", text: "Making a global impact" },
      ]),
      ctaBlock("Join Us", "We're hiring talented people"),
    ],
  },

  // ========== HOME & GARDEN ==========
  {
    key: "home-furniture",
    name: "Furniture Store",
    category: "Home & Garden",
    accent: "#a16207",
    thumbnail: img("furniture", 600, 360),
    blocks: [
      heroBlock("Beautiful Homes Start Here", "FURNITURE STORE", "Premium furniture and home décor", "linear-gradient(135deg,#a16207,#78350f)"),
      sectionHeadingBlock("COLLECTIONS", "Our Range", "Contemporary and classic styles"),
      featuresBlock([
        { icon: "bi-box", title: "Furniture", text: "Sofas, tables, and more" },
        { icon: "bi-palette", title: "Décor", text: "Accessories and wall art" },
        { icon: "bi-lightning-charge", title: "Fast Delivery", text: "Quick shipping available" },
      ]),
      ctaBlock("Shop Now", "Find your perfect piece"),
    ],
  },
];
