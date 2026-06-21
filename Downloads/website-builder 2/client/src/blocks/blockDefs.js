// Block definitions: widget panel entries + default props + which fields are editable.
export const BLOCK_DEFS = [
  { type: "sectionHeading", icon: "bi-card-heading", label: "Section Heading", defaults: { eyebrow: "WHY US", title: "A great section title", subtitle: "Supporting sentence that explains the section." } },
  { type: "heading", icon: "bi-type-h1", label: "Heading", defaults: { text: "Heading", align: "left" } },
  { type: "paragraph", icon: "bi-text-paragraph", label: "Paragraph", defaults: { text: "Some text...", align: "left" } },
  { type: "hero", icon: "bi-easel", label: "Hero", defaults: { eyebrow: "WELCOME", title: "Big bold headline", subtitle: "A short supporting line under the headline.", buttonText: "Get Started", buttonLink: "#" } },
  { type: "features", icon: "bi-grid-3x3-gap", label: "Features", defaults: { cols: 3, items: [
    { icon: "bi-lightning-charge", title: "Fast", text: "Lightning quick performance." },
    { icon: "bi-shield-check", title: "Secure", text: "Enterprise-grade security." },
    { icon: "bi-graph-up-arrow", title: "Scalable", text: "Grows with your needs." },
  ] } },
  { type: "stats", icon: "bi-bar-chart", label: "Stats", defaults: { items: [
    { value: "10k+", label: "Customers" }, { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" }, { value: "50+", label: "Countries" },
  ] } },
  { type: "gallery", icon: "bi-images", label: "Gallery", defaults: { images: [
    "https://picsum.photos/seed/g1/600/400", "https://picsum.photos/seed/g2/600/400", "https://picsum.photos/seed/g3/600/400",
  ] } },
  { type: "testimonial", icon: "bi-chat-quote", label: "Testimonial", defaults: { items: [
    { quote: "This product changed how we work. Absolutely brilliant.", name: "Jane Doe", role: "CEO, Acme", rating: 5, avatar: "https://i.pravatar.cc/100?img=1" },
    { quote: "Reliable, fast, and beautifully designed.", name: "John Smith", role: "CTO, Globex", rating: 5, avatar: "https://i.pravatar.cc/100?img=2" },
  ] } },
  { type: "team", icon: "bi-people", label: "Team", defaults: { items: [
    { name: "Alice", role: "Founder", photo: "https://i.pravatar.cc/200?img=5" },
    { name: "Bob", role: "Engineer", photo: "https://i.pravatar.cc/200?img=6" },
    { name: "Carol", role: "Designer", photo: "https://i.pravatar.cc/200?img=7" },
    { name: "Dave", role: "Sales", photo: "https://i.pravatar.cc/200?img=8" },
  ] } },
  { type: "pricing", icon: "bi-tags", label: "Pricing", defaults: { plans: [
    { name: "Starter", price: "$9", period: "/mo", features: ["1 website", "Basic support"], cta: "Start" },
    { name: "Pro", price: "$29", period: "/mo", features: ["10 websites", "Priority support", "Analytics"], cta: "Choose Pro", featured: true },
    { name: "Enterprise", price: "$99", period: "/mo", features: ["Unlimited", "Dedicated manager"], cta: "Contact" },
  ] } },
  { type: "faq", icon: "bi-question-circle", label: "FAQ", defaults: { items: [
    { q: "How do I get started?", a: "Sign up and follow the onboarding steps." },
    { q: "Can I cancel anytime?", a: "Yes, anytime from your dashboard." },
  ] } },
  { type: "cta", icon: "bi-megaphone", label: "Call to Action", defaults: { title: "Ready to get started?", subtitle: "Join thousands of happy customers today.", buttonText: "Sign Up Free", buttonLink: "#" } },
  { type: "logos", icon: "bi-bookmark-star", label: "Logo Strip", defaults: { items: [
    "https://dummyimage.com/120x40/cccccc/333&text=Logo1", "https://dummyimage.com/120x40/cccccc/333&text=Logo2",
    "https://dummyimage.com/120x40/cccccc/333&text=Logo3", "https://dummyimage.com/120x40/cccccc/333&text=Logo4",
  ] } },
  { type: "image", icon: "bi-image", label: "Image", defaults: { src: "https://picsum.photos/seed/img/800/400", alt: "", full: true } },
  { type: "button", icon: "bi-hand-index", label: "Button", defaults: { text: "Click me", href: "#", variant: "solid" } },
  { type: "divider", icon: "bi-dash-lg", label: "Divider", defaults: {} },
];

export const BLOCK_MAP = Object.fromEntries(BLOCK_DEFS.map((b) => [b.type, b]));
