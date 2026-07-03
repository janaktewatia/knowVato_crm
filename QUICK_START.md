# Quick Start Guide - WhatsApp CRM

## 🚀 Your Application is Already Running!

### ✅ Current Status
- **Backend API**: http://localhost:4000 (Running ✓)
- **Frontend UI**: http://localhost:5173 (Running ✓)
- **Database**: MongoDB Atlas (Connected ✓)
- **Demo Data**: Seeded and ready (✓)

---

## 📱 Access the Application NOW

### Open in Browser
👉 **http://localhost:5173**

### Login Credentials
```
Email:    priya@greenwood.edu
Password: password123
```

(This is the Administrator account with full access)

---

## 🎯 What You Can Do

### Leads Management
- View all leads with status, scores, and owner info
- Create new leads
- Update lead information
- Track leads across multiple service pipelines (CRM, WhatsApp, Events)
- Add notes to leads
- Change lead status

### Follow-ups
- Schedule follow-up tasks
- Track pending follow-ups by due date
- Mark follow-ups as complete
- Reschedule follow-ups

### WhatsApp Conversations
- View incoming WhatsApp conversations
- Reply to messages (text or templates)
- Track conversation window (24-hour rule)
- See message history

### Campaigns
- Create WhatsApp/Email campaigns
- Select templates
- Define audience
- Launch campaigns
- Pause campaigns
- Track delivery metrics

### Templates
- Manage WhatsApp and Email templates
- Create new templates
- Set template categories and language

### Analytics
- View conversion funnel
- Track conversion by source
- See team performance metrics
- Monitor lead distribution

### Settings (Setup)
- Manage users and roles
- Configure custom statuses
- Set up lead sources
- Create service pipelines
- Manage integrations
- Configure WhatsApp accounts

---

## 🔧 Managing Services

### To Stop the Application
Press **Ctrl+C** in each terminal running:
- Backend server
- Frontend server

### To Restart
**Terminal 1 - Backend API**
```bash
cd /Users/edunextion/Downloads/"whatsApp CRM"/backend
npm run dev
```

**Terminal 2 - Frontend UI**
```bash
cd /Users/edunextion/Downloads/"whatsApp CRM"/frontend
npm run dev
```

---

## 💡 Key Features Explained

### Multi-Tenant Support
- Each organization (tenant) has isolated data
- Greenwood International is your demo tenant
- Users can only see their tenant's data

### Multi-Status Pipeline
- Leads progress through statuses (New → Contacted → Qualified → etc.)
- Customizable status workflow
- Sub-statuses for detailed tracking

### Multi-Service Tracking
- Same lead can be in multiple services
- Each service has its own pipeline
- Independent follow-ups per service

### Permission-Based Access
- Admin: Full access to everything
- Manager: Can manage leads, but not settings
- Counsellor: Can only work on assigned leads/chats
- Viewer: Read-only access to dashboards

### WhatsApp Integration
- Currently in simulation mode (safe for testing)
- Can be switched to live Meta/Pinnacle accounts
- Supports templates and free-form messages
- Webhook support for inbound messages

---

## 📊 Demo Data Included

When you login, you'll see:
- **14 Leads** - Across various stages of the sales funnel
- **18 Contacts** - Pre-loaded contact database
- **17 Follow-ups** - Pending tasks to follow up on
- **5 Users** - Different roles to test permissions
- **2 Campaigns** - Ready to explore
- **10+ Conversations** - WhatsApp message threads

---

## 🔐 Security Notes

- Passwords are securely hashed with bcrypt
- JWT tokens expire after 7 days
- Each tenant's data is completely isolated
- All database modifications are logged in the audit trail
- Rate limiting protects against abuse
- CORS is configured for your local development URLs

---

## 📚 More Information

For detailed information, see:
- **SETUP_AND_OPTIMIZATION.md** - Complete setup guide and API reference
- **OPTIMIZATION_COMPLETE.md** - Detailed optimization report

---

## 🆘 Troubleshooting

### Login Not Working
- Make sure database was seeded
- Use exact credentials: `priya@greenwood.edu` / `password123`
- Check backend health: `curl http://localhost:4000/health`

### Frontend Not Loading
- Check if both services are running
- Clear browser cache (Ctrl+Shift+Del)
- Make sure port 5173 is not blocked

### Backend API Errors
- Verify MongoDB Atlas connection
- Check `.env` file exists with MONGO_URI
- Restart backend: `npm run dev`

### Port Already in Use
```bash
# Find what's using port 4000 or 5173
lsof -i :4000
lsof -i :5173

# Kill process
kill -9 <PID>
```

---

## 🎓 API Endpoints (Advanced Users)

All API requests require authentication. Example:
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:4000/api/leads
```

Key endpoints:
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `GET /api/conversations` - List conversations
- `POST /api/campaigns` - Create campaign
- `GET /api/conversion/stats` - Get analytics

See SETUP_AND_OPTIMIZATION.md for complete API documentation.

---

## 🚀 Next Steps

1. **Explore the UI** - Click around and get familiar with the interface
2. **Create a new lead** - Test the lead creation form
3. **Schedule a follow-up** - Try the follow-up feature
4. **Send a message** - Use the simulation WhatsApp feature
5. **Check analytics** - View the conversion stats
6. **Test different roles** - Login as ananya@greenwood.edu to see limited views

---

## ✨ Enjoy Your CRM!

You now have a fully functional WhatsApp Business CRM with:
- Lead management
- WhatsApp integration
- Email campaigns
- Team collaboration
- Analytics and reporting
- Multi-tenant support
- Role-based permissions

**Happy selling! 🎉**

---

**Questions or issues?** Check the detailed documentation files included in this folder.
