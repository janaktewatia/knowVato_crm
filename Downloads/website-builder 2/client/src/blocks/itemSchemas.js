// Defines the editable fields for each "list" block's items, so the visual
// editor can render proper inputs (add/remove/edit) instead of raw JSON.
export const LIST_BLOCKS = {
  features: {
    key: "items", label: "Feature",
    fields: [
      { name: "icon", label: "Icon (bi-*)", type: "icon" },
      { name: "title", label: "Title", type: "text" },
      { name: "text", label: "Description", type: "textarea" },
    ],
    blank: { icon: "bi-star", title: "New feature", text: "Description here." },
  },
  stats: {
    key: "items", label: "Stat",
    fields: [
      { name: "value", label: "Value", type: "text" },
      { name: "label", label: "Label", type: "text" },
    ],
    blank: { value: "100+", label: "Metric" },
  },
  gallery: {
    key: "images", label: "Image", simpleList: true,
    fields: [{ name: "_", label: "Image URL", type: "image" }],
    blank: "https://picsum.photos/seed/new/600/400",
  },
  logos: {
    key: "items", label: "Logo", simpleList: true,
    fields: [{ name: "_", label: "Logo URL", type: "image" }],
    blank: "https://dummyimage.com/120x40/cccccc/333&text=Logo",
  },
  testimonial: {
    key: "items", label: "Testimonial",
    fields: [
      { name: "quote", label: "Quote", type: "textarea" },
      { name: "name", label: "Name", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "rating", label: "Rating (1-5)", type: "number" },
      { name: "avatar", label: "Avatar URL", type: "image" },
    ],
    blank: { quote: "Great service!", name: "Customer", role: "Title", rating: 5, avatar: "https://i.pravatar.cc/100" },
  },
  team: {
    key: "items", label: "Member",
    fields: [
      { name: "name", label: "Name", type: "text" },
      { name: "role", label: "Role", type: "text" },
      { name: "photo", label: "Photo URL", type: "image" },
    ],
    blank: { name: "New Member", role: "Role", photo: "https://i.pravatar.cc/200" },
  },
  pricing: {
    key: "plans", label: "Plan",
    fields: [
      { name: "name", label: "Plan name", type: "text" },
      { name: "price", label: "Price", type: "text" },
      { name: "period", label: "Period (e.g. /mo)", type: "text" },
      { name: "features", label: "Features (one per line)", type: "lines" },
      { name: "cta", label: "Button text", type: "text" },
      { name: "featured", label: "Highlighted plan", type: "bool" },
    ],
    blank: { name: "New Plan", price: "$0", period: "/mo", features: ["Feature 1"], cta: "Choose", featured: false },
  },
  faq: {
    key: "items", label: "Question",
    fields: [
      { name: "q", label: "Question", type: "text" },
      { name: "a", label: "Answer", type: "textarea" },
    ],
    blank: { q: "New question?", a: "Answer here." },
  },
};
