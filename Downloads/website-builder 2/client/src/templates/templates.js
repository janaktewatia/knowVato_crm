// Website templates - includes original 10 templates + 34 additional professional templates
// Each = { key, name, category, accent, thumbnail, blocks[] }

import { TEMPLATES_50 } from "./templates-50.js";

const img = (s, w = 800, h = 400) => `https://picsum.photos/seed/${s}/${w}/${h}`;

const ORIGINAL_TEMPLATES = [
  {
    key: "corporate", name: "Corporate", category: "Business", accent: "#1d4ed8",
    thumbnail: img("corp", 600, 360),
    blocks: [
      { type: "hero", props: { eyebrow: "TRUSTED SINCE 2005", title: "Building the future of business", subtitle: "We help companies grow with strategy, technology and design.", buttonText: "Get a Quote", buttonLink: "#contact", bg: "linear-gradient(135deg,#1d4ed8,#0b1f5c)" } },
      { type: "logos", props: { items: ["https://dummyimage.com/120x40/eeeeee/888&text=ACME","https://dummyimage.com/120x40/eeeeee/888&text=GLOBEX","https://dummyimage.com/120x40/eeeeee/888&text=INITECH","https://dummyimage.com/120x40/eeeeee/888&text=UMBRELLA"] } },
      { type: "sectionHeading", props: { eyebrow: "WHAT WE DO", title: "Solutions that scale", subtitle: "End-to-end services tailored to your business." } },
      { type: "features", props: { cols: 3, items: [
        { icon: "bi-briefcase", title: "Consulting", text: "Strategic guidance from industry experts." },
        { icon: "bi-gear-wide-connected", title: "Operations", text: "Streamline and automate your workflows." },
        { icon: "bi-graph-up-arrow", title: "Growth", text: "Data-driven marketing and sales." },
      ] } },
      { type: "stats", props: { items: [{ value: "500+", label: "Clients" },{ value: "20yrs", label: "Experience" },{ value: "98%", label: "Retention" },{ value: "30+", label: "Countries" }] } },
      { type: "cta", props: { title: "Let's work together", subtitle: "Tell us about your project and we'll get back within 24 hours.", buttonText: "Contact Us", buttonLink: "#contact" } },
    ],
  },
  {
    key: "saas", name: "SaaS / Startup", category: "Technology", accent: "#7c3aed",
    thumbnail: img("saas", 600, 360),
    blocks: [
      { type: "hero", props: { eyebrow: "NEW", title: "Ship faster with our platform", subtitle: "Everything your team needs to build, launch and scale — in one place.", buttonText: "Start Free Trial", buttonLink: "#", bg: "linear-gradient(135deg,#7c3aed,#3b0764)" } },
      { type: "features", props: { cols: 3, items: [
        { icon: "bi-lightning-charge", title: "Blazing Fast", text: "Sub-second response times globally." },
        { icon: "bi-puzzle", title: "Integrations", text: "Connect 100+ tools you already use." },
        { icon: "bi-shield-lock", title: "Secure", text: "SOC2 compliant, encrypted at rest." },
      ] } },
      { type: "stats", props: { items: [{ value: "10k+", label: "Teams" },{ value: "99.9%", label: "Uptime" },{ value: "5M+", label: "API calls/day" },{ value: "4.9★", label: "Rating" }] } },
      { type: "testimonial", props: { items: [
        { quote: "We cut our deploy time in half within a week.", name: "Sarah Lin", role: "VP Eng, Nimbus", rating: 5, avatar: "https://i.pravatar.cc/100?img=10" },
        { quote: "The best developer experience we've used.", name: "Marco Reyes", role: "CTO, Forge", rating: 5, avatar: "https://i.pravatar.cc/100?img=12" },
      ] } },
      { type: "pricing", props: { plans: [
        { name: "Hobby", price: "$0", period: "/mo", features: ["1 project","Community support"], cta: "Start" },
        { name: "Pro", price: "$29", period: "/mo", features: ["Unlimited projects","Priority support","Analytics"], cta: "Go Pro", featured: true },
        { name: "Team", price: "$99", period: "/mo", features: ["SSO","Audit logs","SLA"], cta: "Contact" },
      ] } },
      { type: "cta", props: { title: "Start building today", subtitle: "No credit card required.", buttonText: "Get Started", buttonLink: "#" } },
    ],
  },
  {
    key: "school", name: "School / Education", category: "Education", accent: "#0891b2",
    thumbnail: img("school", 600, 360),
    blocks: [
      { type: "hero", props: { eyebrow: "ADMISSIONS OPEN 2025", title: "Nurturing tomorrow's leaders", subtitle: "A safe, inspiring environment where every child thrives.", buttonText: "Apply Now", buttonLink: "#admission", bg: "linear-gradient(135deg,#0891b2,#083344)" } },
      { type: "sectionHeading", props: { eyebrow: "WHY CHOOSE US", title: "Excellence in education", subtitle: "Holistic development through academics, sports and arts." } },
      { type: "features", props: { cols: 3, items: [
        { icon: "bi-book", title: "Academics", text: "Rigorous curriculum with modern pedagogy." },
        { icon: "bi-trophy", title: "Sports", text: "State-of-the-art facilities and coaching." },
        { icon: "bi-palette", title: "Arts", text: "Music, dance, and creative expression." },
      ] } },
      { type: "stats", props: { items: [{ value: "1500+", label: "Students" },{ value: "120", label: "Teachers" },{ value: "40yrs", label: "Legacy" },{ value: "100%", label: "Results" }] } },
      { type: "gallery", props: { images: [img("sch1",600,400),img("sch2",600,400),img("sch3",600,400)] } },
      { type: "cta", props: { title: "Give your child the best start", subtitle: "Schedule a campus visit today.", buttonText: "Book a Visit", buttonLink: "#" } },
    ],
  },
  {
    key: "hospital", name: "Hospital / Clinic", category: "Healthcare", accent: "#0d9488",
    thumbnail: img("hosp", 600, 360),
    blocks: [
      { type: "hero", props: { eyebrow: "24/7 EMERGENCY CARE", title: "Your health, our priority", subtitle: "World-class medical care with compassion and expertise.", buttonText: "Book Appointment", buttonLink: "#", bg: "linear-gradient(135deg,#0d9488,#053b35)" } },
      { type: "features", props: { cols: 3, items: [
        { icon: "bi-heart-pulse", title: "Cardiology", text: "Advanced heart care and surgery." },
        { icon: "bi-clipboard2-pulse", title: "Diagnostics", text: "Modern labs and imaging." },
        { icon: "bi-capsule", title: "Pharmacy", text: "In-house 24/7 pharmacy." },
      ] } },
      { type: "stats", props: { items: [{ value: "200+", label: "Doctors" },{ value: "50k+", label: "Patients/yr" },{ value: "30+", label: "Specialties" },{ value: "24/7", label: "Emergency" }] } },
      { type: "team", props: { items: [
        { name: "Dr. Mehta", role: "Cardiologist", photo: "https://i.pravatar.cc/200?img=13" },
        { name: "Dr. Rao", role: "Neurologist", photo: "https://i.pravatar.cc/200?img=14" },
        { name: "Dr. Khan", role: "Pediatrician", photo: "https://i.pravatar.cc/200?img=15" },
        { name: "Dr. Iyer", role: "Surgeon", photo: "https://i.pravatar.cc/200?img=16" },
      ] } },
      { type: "cta", props: { title: "Need medical assistance?", subtitle: "Our team is available around the clock.", buttonText: "Contact Us", buttonLink: "#" } },
    ],
  },
  {
    key: "restaurant", name: "Restaurant / Cafe", category: "Food", accent: "#b45309",
    thumbnail: img("resto", 600, 360),
    blocks: [
      { type: "hero", props: { eyebrow: "FINE DINING", title: "A taste you'll remember", subtitle: "Authentic flavors, fresh ingredients, unforgettable ambiance.", buttonText: "Reserve a Table", buttonLink: "#", bg: "linear-gradient(135deg,#b45309,#3b1d02)" } },
      { type: "sectionHeading", props: { eyebrow: "OUR MENU", title: "Crafted with passion", subtitle: "Seasonal dishes from our award-winning chefs." } },
      { type: "gallery", props: { images: [img("food1",600,400),img("food2",600,400),img("food3",600,400),img("food4",600,400),img("food5",600,400),img("food6",600,400)] } },
      { type: "testimonial", props: { items: [
        { quote: "Best meal I've had in years. The ambiance is perfect.", name: "Priya S.", role: "Food Blogger", rating: 5, avatar: "https://i.pravatar.cc/100?img=20" },
      ] } },
      { type: "cta", props: { title: "Book your table tonight", subtitle: "Open daily 12pm – 11pm.", buttonText: "Reserve Now", buttonLink: "#" } },
    ],
  },
  {
    key: "agency", name: "Portfolio / Agency", category: "Creative", accent: "#db2777",
    thumbnail: img("agency", 600, 360),
    blocks: [
      { type: "hero", props: { eyebrow: "CREATIVE STUDIO", title: "We design experiences", subtitle: "Branding, web, and product design for ambitious brands.", buttonText: "View Work", buttonLink: "#", bg: "linear-gradient(135deg,#db2777,#500724)" } },
      { type: "gallery", props: { images: [img("work1",600,400),img("work2",600,400),img("work3",600,400),img("work4",600,400),img("work5",600,400),img("work6",600,400)] } },
      { type: "sectionHeading", props: { eyebrow: "SERVICES", title: "What we offer" } },
      { type: "features", props: { cols: 3, items: [
        { icon: "bi-brush", title: "Branding", text: "Identity that stands out." },
        { icon: "bi-window", title: "Web Design", text: "Beautiful, fast websites." },
        { icon: "bi-phone", title: "Product", text: "Apps people love to use." },
      ] } },
      { type: "cta", props: { title: "Let's create something great", subtitle: "Tell us about your project.", buttonText: "Start a Project", buttonLink: "#" } },
    ],
  },
  {
    key: "ecommerce", name: "E-commerce / Product", category: "Retail", accent: "#16a34a",
    thumbnail: img("shop", 600, 360),
    blocks: [
      { type: "hero", props: { eyebrow: "NEW COLLECTION", title: "Style that speaks for you", subtitle: "Shop the latest trends with free shipping worldwide.", buttonText: "Shop Now", buttonLink: "#", bg: "linear-gradient(135deg,#16a34a,#052e16)" } },
      { type: "features", props: { cols: 4, items: [
        { icon: "bi-truck", title: "Free Shipping", text: "On orders over $50." },
        { icon: "bi-arrow-repeat", title: "Easy Returns", text: "30-day return policy." },
        { icon: "bi-shield-check", title: "Secure Pay", text: "100% protected checkout." },
        { icon: "bi-headset", title: "Support", text: "24/7 customer care." },
      ] } },
      { type: "gallery", props: { images: [img("prod1",600,600),img("prod2",600,600),img("prod3",600,600),img("prod4",600,600),img("prod5",600,600),img("prod6",600,600)] } },
      { type: "cta", props: { title: "Get 10% off your first order", subtitle: "Sign up for our newsletter.", buttonText: "Subscribe", buttonLink: "#" } },
    ],
  },
  {
    key: "ngo", name: "NGO / Non-profit", category: "Non-profit", accent: "#ca8a04",
    thumbnail: img("ngo", 600, 360),
    blocks: [
      { type: "hero", props: { eyebrow: "TOGETHER WE CAN", title: "Make a difference today", subtitle: "Join us in creating lasting change for communities in need.", buttonText: "Donate Now", buttonLink: "#", bg: "linear-gradient(135deg,#ca8a04,#422006)" } },
      { type: "stats", props: { items: [{ value: "2M+", label: "Lives touched" },{ value: "120", label: "Projects" },{ value: "45", label: "Countries" },{ value: "10k", label: "Volunteers" }] } },
      { type: "sectionHeading", props: { eyebrow: "OUR CAUSES", title: "Where your help goes" } },
      { type: "features", props: { cols: 3, items: [
        { icon: "bi-droplet", title: "Clean Water", text: "Wells and sanitation projects." },
        { icon: "bi-book", title: "Education", text: "Schools and scholarships." },
        { icon: "bi-house-heart", title: "Shelter", text: "Homes for displaced families." },
      ] } },
      { type: "cta", props: { title: "Your contribution matters", subtitle: "Every donation creates real impact.", buttonText: "Donate", buttonLink: "#" } },
    ],
  },
  {
    key: "realestate", name: "Real Estate", category: "Property", accent: "#475569",
    thumbnail: img("realty", 600, 360),
    blocks: [
      { type: "hero", props: { eyebrow: "FIND YOUR HOME", title: "Luxury living, redefined", subtitle: "Discover premium properties in the most sought-after locations.", buttonText: "Browse Listings", buttonLink: "#", bg: "linear-gradient(135deg,#475569,#1e293b)" } },
      { type: "gallery", props: { images: [img("home1",600,400),img("home2",600,400),img("home3",600,400)] } },
      { type: "features", props: { cols: 3, items: [
        { icon: "bi-house-door", title: "Buy", text: "Verified listings, no surprises." },
        { icon: "bi-key", title: "Rent", text: "Flexible options for every budget." },
        { icon: "bi-building", title: "Commercial", text: "Office and retail spaces." },
      ] } },
      { type: "stats", props: { items: [{ value: "5000+", label: "Properties" },{ value: "1200", label: "Sold" },{ value: "15yrs", label: "Trust" },{ value: "4.8★", label: "Rated" }] } },
      { type: "cta", props: { title: "Ready to find your dream home?", subtitle: "Talk to our property experts.", buttonText: "Get in Touch", buttonLink: "#" } },
    ],
  },
  {
    key: "event", name: "Event / Conference", category: "Events", accent: "#e11d48",
    thumbnail: img("event", 600, 360),
    blocks: [
      { type: "hero", props: { eyebrow: "DEC 12–14, 2025 · SAN FRANCISCO", title: "The future of tech, live", subtitle: "Three days of talks, workshops and networking with industry leaders.", buttonText: "Get Tickets", buttonLink: "#", bg: "linear-gradient(135deg,#e11d48,#4c0519)" } },
      { type: "stats", props: { items: [{ value: "50+", label: "Speakers" },{ value: "3", label: "Days" },{ value: "20", label: "Workshops" },{ value: "5k", label: "Attendees" }] } },
      { type: "sectionHeading", props: { eyebrow: "SPEAKERS", title: "Learn from the best" } },
      { type: "team", props: { items: [
        { name: "Lena Cho", role: "Keynote · AI", photo: "https://i.pravatar.cc/200?img=30" },
        { name: "Raj Patel", role: "Cloud", photo: "https://i.pravatar.cc/200?img=31" },
        { name: "Mia Wong", role: "Design", photo: "https://i.pravatar.cc/200?img=32" },
        { name: "Tom Reed", role: "Security", photo: "https://i.pravatar.cc/200?img=33" },
      ] } },
      { type: "pricing", props: { plans: [
        { name: "Standard", price: "$199", period: "", features: ["All talks","Workshop access"], cta: "Buy" },
        { name: "VIP", price: "$499", period: "", features: ["Front seats","Speaker dinner","Swag"], cta: "Go VIP", featured: true },
      ] } },
      { type: "cta", props: { title: "Don't miss out", subtitle: "Early-bird pricing ends soon.", buttonText: "Register Now", buttonLink: "#" } },
    ],
  },
];

export const TEMPLATES = [...ORIGINAL_TEMPLATES, ...TEMPLATES_50];
export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.key, t]));
