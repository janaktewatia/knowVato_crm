// FRONTEND ONLY MODE - Mock API client with NO network requests
// All data is mocked in-memory for UI/UX development

const mockData = {
  websites: [
    { _id: "1", name: "My Portfolio", category: "portfolio", status: "published", slug: "my-portfolio", createdAt: new Date(), description: "Personal portfolio" },
    { _id: "2", name: "Business Site", category: "corporate", status: "draft", slug: "business-site", createdAt: new Date(), description: "Business website" },
  ],
  pages: [
    { _id: "p1", name: "Home", siteId: "1", status: "published", type: "home" },
    { _id: "p2", name: "About", siteId: "1", status: "published", type: "page" },
    { _id: "p3", name: "Services", siteId: "1", status: "draft", type: "page" },
  ],
  media: [],
  forms: [
    { _id: "f1", name: "Contact Form", type: "contact", status: "published" },
  ],
  news: [
    { _id: "n1", name: "Latest Update", status: "published", featured: true },
  ],
  events: [
    { _id: "e1", name: "Annual Meeting", status: "published", date: new Date() },
  ],
  themes: [],
  menus: [],
  banners: [],
  popups: [],
  templates: [
    { _id: "t1", name: "Corporate", category: "corporate", preview: "/templates/corporate.jpg" },
    { _id: "t2", name: "SaaS", category: "saas", preview: "/templates/saas.jpg" },
    { _id: "t3", name: "School", category: "school", preview: "/templates/school.jpg" },
  ],
};

const mockResponses = {
  "/dashboard/stats": {
    cards: {
      totalWebsites: mockData.websites.length,
      publishedWebsites: mockData.websites.filter(w => w.status === "published").length,
      draftWebsites: mockData.websites.filter(w => w.status === "draft").length,
      totalPages: mockData.pages.length,
    },
    recentActivities: [],
  },
  "/websites": { items: mockData.websites, total: mockData.websites.length, page: 1, pages: 1 },
  "/users/me/permissions": { isSuperAdmin: true, permissions: {}, modules: [] },
  "/forms": { items: mockData.forms, total: mockData.forms.length, page: 1, pages: 1 },
  "/media": { items: mockData.media, total: mockData.media.length, page: 1, pages: 1 },
  "/news": { items: mockData.news, total: mockData.news.length, page: 1, pages: 1 },
  "/events": { items: mockData.events, total: mockData.events.length, page: 1, pages: 1 },
  "/themes": { items: mockData.themes, total: mockData.themes.length, page: 1, pages: 1 },
  "/menus": { items: mockData.menus, total: mockData.menus.length, page: 1, pages: 1 },
  "/banners": { items: mockData.banners, total: mockData.banners.length, page: 1, pages: 1 },
  "/popups": { items: mockData.popups, total: mockData.popups.length, page: 1, pages: 1 },
  "/pages": { items: mockData.pages, total: mockData.pages.length, page: 1, pages: 1 },
  "/templates": { items: mockData.templates, total: mockData.templates.length, page: 1, pages: 1 },
  "/analytics": { traffic: [], devices: [], browsers: [], sources: [] },
};

// Mock API client - No network requests, all in-memory
class MockAPI {
  get(url) {
    const path = url.replace(/\?.*/, ""); // Remove query params

    // Handle dynamic routes like /chatbot/admin/:siteId
    if (path.includes("/chatbot/admin/")) {
      const chatbotData = {
        enabled: true,
        botName: "Website Bot",
        greeting: "Hello! How can I help you today?",
        fallback: "I'm not sure how to answer that. Please contact us.",
        color: "#0d6efd",
        rules: [
          { keywords: ["hello", "hi"], answer: "Hello! Welcome to our website." },
          { keywords: ["hours", "open"], answer: "We're open 9 AM - 5 PM, Monday to Friday." }
        ]
      };
      return Promise.resolve({ data: chatbotData });
    }

    // Media folders endpoint
    if (path.includes("/media/folders/all")) {
      return Promise.resolve({
        data: [
          { _id: "1", name: "Images", path: "/images" },
          { _id: "2", name: "Videos", path: "/videos" },
          { _id: "3", name: "Documents", path: "/documents" }
        ]
      });
    }

    // Media stats endpoint
    if (path.includes("/media/stats")) {
      return Promise.resolve({
        data: {
          total: mockData.media.length,
          byType: [
            { _id: "image", count: 0 },
            { _id: "video", count: 0 },
            { _id: "pdf", count: 0 },
            { _id: "document", count: 0 },
            { _id: "audio", count: 0 },
            { _id: "other", count: 0 }
          ],
          totalSize: 0
        }
      });
    }

    // Pages by website
    if (path.includes("/websites/") && path.includes("/pages")) {
      return Promise.resolve({
        data: {
          items: mockData.pages,
          total: mockData.pages.length,
          page: 1,
          pages: 1
        }
      });
    }

    // Form responses
    if (path.includes("/forms/") && path.includes("/responses")) {
      return Promise.resolve({
        data: {
          items: [],
          total: 0,
          page: 1,
          pages: 1
        }
      });
    }

    // SEO endpoint
    if (path.includes("/seo")) {
      return Promise.resolve({
        data: {
          items: [],
          total: 0,
          page: 1,
          pages: 1
        }
      });
    }

    // Settings endpoint
    if (path.includes("/settings")) {
      return Promise.resolve({
        data: {
          smtp: { enabled: false, host: "", port: 587, secure: true, fromEmail: "", password: "" },
          security: { forceHttps: false, loginAttempts: 5, sessionTimeout: 30 },
          webhooks: []
        }
      });
    }

    // Employee types
    if (path.includes("/employee-types")) {
      return Promise.resolve({
        data: {
          items: [
            { _id: "1", name: "Admin", permissions: {} },
            { _id: "2", name: "Editor", permissions: {} },
            { _id: "3", name: "Viewer", permissions: {} }
          ],
          total: 3,
          page: 1,
          pages: 1
        }
      });
    }

    // Users
    if (path.includes("/users") && !path.includes("/me")) {
      return Promise.resolve({
        data: {
          items: [],
          total: 0,
          page: 1,
          pages: 1
        }
      });
    }

    // User permissions
    if (path.includes("/users/me/permissions")) {
      return Promise.resolve({
        data: {
          isSuperAdmin: true,
          permissions: {},
          modules: []
        }
      });
    }

    // Analytics overview
    if (path.includes("/analytics/overview")) {
      return Promise.resolve({
        data: {
          totals: {
            total: 0,
            unique: 0,
            returning: 0
          },
          byDay: [],
          byDevice: [
            { _id: "Desktop", count: 0 },
            { _id: "Mobile", count: 0 },
            { _id: "Tablet", count: 0 }
          ],
          byBrowser: [
            { _id: "Chrome", count: 0 },
            { _id: "Firefox", count: 0 },
            { _id: "Safari", count: 0 }
          ],
          bySource: [
            { _id: "Direct", count: 0 },
            { _id: "Organic", count: 0 },
            { _id: "Referral", count: 0 }
          ]
        }
      });
    }

    // Backup endpoint (returns JSON blob)
    if (path.includes("/backup") && url.includes("download=true")) {
      const backupData = {
        exported: new Date().toISOString(),
        data: {
          websites: mockData.websites,
          pages: mockData.pages,
          media: mockData.media,
          forms: mockData.forms,
          news: mockData.news,
          events: mockData.events
        }
      };
      return Promise.resolve({ data: JSON.stringify(backupData) });
    }

    // Page/Form details (for builders)
    if (path.match(/\/(pages|forms)\/.+\/data/)) {
      return Promise.resolve({
        data: {
          title: "Untitled",
          content: [],
          settings: {},
          blocks: []
        }
      });
    }

    // SEO per website
    if (path.includes("/seo/website/")) {
      return Promise.resolve({
        data: {
          siteId: "",
          metaTitle: "",
          metaDescription: "",
          ogImage: "",
          robots: "index, follow",
          schema: {}
        }
      });
    }

    const matchedKey = Object.keys(mockResponses).find(k => path.includes(k));
    const data = matchedKey ? mockResponses[matchedKey] : { items: [], total: 0, page: 1, pages: 1 };
    return Promise.resolve({ data });
  }

  post(url, payload) {
    // Handle backup restore
    if (url.includes("/backup/restore")) {
      console.log(`[MOCK] Restored backup in ${payload.mode} mode`);
      return Promise.resolve({
        data: {
          success: true,
          restored: {
            websites: payload.backup?.data?.websites?.length || 0,
            pages: payload.backup?.data?.pages?.length || 0,
            media: payload.backup?.data?.media?.length || 0,
            forms: payload.backup?.data?.forms?.length || 0,
            news: payload.backup?.data?.news?.length || 0,
            events: payload.backup?.data?.events?.length || 0
          }
        }
      });
    }

    // Handle media folder creation
    if (url.includes("/media/folders")) {
      console.log(`[MOCK] Created folder:`, payload);
      return Promise.resolve({ data: { success: true, _id: "folder-" + Date.now() } });
    }

    // Handle media upload
    if (url.includes("/media/upload")) {
      console.log(`[MOCK] Uploaded files to:`, payload.get("folder"));
      return Promise.resolve({ data: { success: true } });
    }

    // Handle media bulk delete
    if (url.includes("/media/bulk-delete")) {
      console.log(`[MOCK] Deleted ${payload.ids?.length || 0} files`);
      return Promise.resolve({ data: { success: true } });
    }

    // Add to mockData
    const resource = url.split("/")[1]; // Get resource name from url
    if (mockData[resource]) {
      const newItem = { _id: "new-" + Date.now(), ...payload, createdAt: new Date() };
      mockData[resource].push(newItem);
      console.log(`[MOCK] Created ${resource}:`, newItem);
      return Promise.resolve({ data: { success: true, _id: newItem._id } });
    }
    return Promise.resolve({ data: { success: true } });
  }

  put(url, payload) {
    // Handle chatbot save
    if (url.includes("/chatbot/admin/")) {
      console.log(`[MOCK] Updated chatbot settings`, payload);
      return Promise.resolve({ data: payload });
    }

    const [, resource, id] = url.split("/");
    if (mockData[resource]) {
      const index = mockData[resource].findIndex(item => item._id === id);
      if (index !== -1) {
        mockData[resource][index] = { ...mockData[resource][index], ...payload };
        console.log(`[MOCK] Updated ${resource} ${id}`);
      }
    }
    return Promise.resolve({ data: { success: true } });
  }

  delete(url) {
    // Handle media folder delete
    if (url.includes("/media/folders/")) {
      console.log(`[MOCK] Deleted folder`);
      return Promise.resolve({ data: { success: true } });
    }

    const [, resource, id] = url.split("/");
    if (mockData[resource]) {
      mockData[resource] = mockData[resource].filter(item => item._id !== id);
      console.log(`[MOCK] Deleted ${resource} ${id}`);
    }
    return Promise.resolve({ data: { success: true } });
  }
}

const api = new MockAPI();
export default api;
