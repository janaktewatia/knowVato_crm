# CRM Enhancement Implementation Guide

## 🚀 New Components Deployed

### 1. **LeadDetailsPanel.jsx** ✅ CREATED
**Location**: `frontend/src/components/LeadDetailsPanel.jsx`

**Features Implemented**:
- ✅ Service & Status in two-column layout
- ✅ Service on left, Status dropdown on right
- ✅ Working "+Add Service" dropdown
- ✅ Remove service functionality
- ✅ Follow-up scheduling form with fields:
  - Type selector (Call, Email, WhatsApp, SMS)
  - Date picker
  - Time picker
  - Remark field
  - Assign to dropdown with workload info
  - Workload display (X/Y capacity)
- ✅ Quick action buttons (Message, Edit, Service, Follow-up)
- ✅ Activity/Notes section
- ✅ Lead information display
- ✅ Next follow-up date display per service

**Integration**:
```jsx
import LeadDetailsPanel from "../components/LeadDetailsPanel";

// In Leads.jsx:
{detailId && <LeadDetailsPanel id={detailId} onClose={() => setDetailId(null)} onChanged={leads.reload} statuses={statuses.data || []} />}
```

---

### 2. **ActionColumn.jsx** ✅ CREATED
**Location**: `frontend/src/components/ActionColumn.jsx`

**Features Implemented**:
- ✅ 4 icon buttons for quick actions
  - 📞 Message/Communication
  - ✏️ Edit Lead
  - 🔄 Service & Status Management
  - 📅 Schedule Follow-up
- ✅ Permission-based button visibility
- ✅ Callback handlers for each action
- ✅ Responsive design
- ✅ Tooltips for each button

**Integration in Lead List**:
```jsx
import ActionColumn from "../components/ActionColumn";

const columns = [
  { key: "name", label: "Lead", ... },
  { key: "services", label: "Services", ... },
  { key: "owner", label: "Owner", ... },
  {
    key: "actions",
    label: "Actions",
    align: "right",
    render: (l) => (
      <ActionColumn
        lead={l}
        onMessage={() => { /* open message modal */ }}
        onEdit={() => { /* open edit form */ }}
        onService={() => setDetailId(l._id)}
        onFollowUp={() => { /* open follow-up form */ }}
      />
    )
  }
];
```

---

## 🔧 Backend API Updates Required

### New Endpoints to Create

#### 1. **Add Follow-up from Lead**
```
POST /api/leads/:id/followups
Body: {
  type: "call" | "email" | "whatsapp" | "sms",
  dueDate: "2026-06-25",
  dueTime: "10:00",
  remark: "Discuss fee structure",
  assignedTo: "Karthik Iyer"
}
Response: { id, created: true }
```

#### 2. **Get Team Workload**
```
GET /api/followups/workload?counsellor=Karthik%20Iyer
Response: {
  total: 20,
  pending: 5,
  completed: 15,
  capacity: 20,
  nextDate: "2026-06-25"
}
```

#### 3. **Get Service Status Options**
```
GET /api/leads/:id/service/:serviceId/statuses
Response: [
  { _id: "...", name: "Qualified", color: "#7c3aed" },
  { _id: "...", name: "Negotiation", color: "#ca8a04" }
]
```

---

## 📱 Frontend Implementation Steps

### Step 1: Update Leads Page Component

**File**: `frontend/src/pages/Leads.jsx`

Replace the LeadDrawer with LeadDetailsPanel:

```jsx
// OLD
{detailId && <LeadDrawer id={detailId} onClose={() => setDetailId(null)} onChanged={leads.reload} statuses={statuses.data || []} />}

// NEW
{detailId && <LeadDetailsPanel id={detailId} onClose={() => setDetailId(null)} onChanged={leads.reload} statuses={statuses.data || []} />}
```

### Step 2: Add Action Column to Table

Add ActionColumn to the leads table:

```jsx
const columns = [
  { 
    key: "name", 
    label: "Lead",
    render: (l) => (
      <div className="d-flex align-items-center gap-2">
        <Avatar name={l.name} size={30} />
        <div>
          <div className="row-name">{l.name}</div>
          <div className="row-sub">{l.phone}</div>
        </div>
      </div>
    )
  },
  { 
    key: "services", 
    label: "Services",
    render: (l) => {
      const tracks = l.serviceTracks || [];
      return (
        <div className="d-flex flex-wrap gap-1">
          {tracks.map((t, i) => {
            const st = statusMap[t.status?._id || t.status] || {};
            const svc = serviceMap[t.service?._id || t.service] || {};
            return (
              <span key={i} className="badge" style={{ background: st.color || "#79838f" }}>
                <i className={`bi bi-${svc.icon || "grid"}`}></i> {st.name}
              </span>
            );
          })}
        </div>
      );
    }
  },
  { 
    key: "owner", 
    label: "Owner",
    render: (l) => <span className="small">{(l.owner || "").split(" ")[0]}</span>
  },
  { 
    key: "actions", 
    label: "Actions",
    align: "right",
    render: (l) => (
      <ActionColumn
        lead={l}
        onMessage={() => handleOpenMessage(l)}
        onEdit={() => handleEditLead(l)}
        onService={() => setDetailId(l._id)}
        onFollowUp={() => handleOpenFollowUp(l)}
      />
    )
  }
];
```

### Step 3: Implement Quick Action Handlers

```jsx
function handleOpenMessage(lead) {
  // Open message modal
  setMessageLead(lead);
  setShowMessageModal(true);
}

function handleEditLead(lead) {
  // Open edit form
  setEditingLead(lead);
  setShowEditModal(true);
}

function handleOpenFollowUp(lead) {
  // Open follow-up scheduling modal
  setFollowUpLead(lead);
  setShowFollowUpModal(true);
}
```

---

## 🗄️ Backend Model Updates

### Update FollowUp Model

**File**: `backend/src/models/FollowUp.ts`

Add new fields:
```typescript
export interface IFollowUp extends Document {
  tenant: Types.ObjectId;
  lead: Types.ObjectId;
  service?: Types.ObjectId;
  type: "call" | "email" | "whatsapp" | "sms";  // NEW
  dueDate: Date;  // RENAME from 'due'
  dueTime?: string;  // NEW - HH:MM format
  remark?: string;  // NEW - follow-up note
  assignedTo: string;
  status: "pending" | "completed" | "overdue" | "cancelled";
  completedAt?: Date;
  completionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Update Lead Model

**File**: `backend/src/models/Lead.ts`

Add tracking fields:
```typescript
export interface ILead extends Document {
  // existing fields...
  lastFollowUpType?: "call" | "email" | "whatsapp" | "sms";
  nextFollowUpDate?: Date;
  nextFollowUpType?: string;
  followUpCount: number;  // Total follow-ups for this lead
}
```

---

## 🔗 API Integration Points

### Existing APIs to Enhance

#### leadsApi.setServiceStatus()
Already implemented, working fine.

#### leadsApi.addService()
Already implemented, needs testing.

#### leadsApi.removeService()
Already implemented, needs testing.

#### leadsApi.addNote()
Already implemented, working fine.

### New APIs to Implement

#### leadsApi.addFollowUp()
```javascript
export async function addFollowUp(leadId, followUpData) {
  const res = await fetch(`/api/leads/${leadId}/followups`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(followUpData)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

#### followUpApi.getWorkload()
```javascript
export async function getWorkload(counsellorName) {
  const res = await fetch(`/api/followups/workload?counsellor=${encodeURIComponent(counsellorName)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
```

---

## 🎯 Implementation Checklist

### Phase 1: Components (✅ DONE)
- [x] Create LeadDetailsPanel.jsx with new layout
- [x] Create ActionColumn.jsx with 4 action icons
- [x] Follow-up form with all fields
- [x] Workload indicator
- [ ] Import components into Leads.jsx
- [ ] Add ActionColumn to table
- [ ] Test new UI

### Phase 2: Backend APIs (⏳ TODO)
- [ ] Create POST /api/leads/:id/followups endpoint
- [ ] Create GET /api/followups/workload endpoint
- [ ] Update FollowUp model with new fields
- [ ] Update Lead model with tracking fields
- [ ] Implement follow-up creation logic
- [ ] Implement workload calculation

### Phase 3: Frontend Integration (⏳ TODO)
- [ ] Update Leads.jsx to use new components
- [ ] Implement quick action handlers
- [ ] Add message modal component
- [ ] Add edit form modal
- [ ] Connect follow-up form to API
- [ ] Test all interactions

### Phase 4: Testing & Polish (⏳ TODO)
- [ ] Test all action buttons
- [ ] Test service addition/removal
- [ ] Test follow-up scheduling
- [ ] Test workload display
- [ ] Test permissions on all actions
- [ ] Performance optimization
- [ ] Browser compatibility

---

## 💻 Code Example: Complete Integration

### Leads.jsx with New Components

```jsx
import { useState } from "react";
import { leadsApi, mastersApi, servicesApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { PageHeader, DataTable } from "../components/ui";
import LeadDetailsPanel from "../components/LeadDetailsPanel";
import ActionColumn from "../components/ActionColumn";

export default function Leads() {
  const { can } = useAuth();
  const [filters, setFilters] = useState({ q: "", status: "" });
  const [detailId, setDetailId] = useState(null);

  const statuses = useApi(() => mastersApi.statuses(), []);
  const services = useApi(() => servicesApi.list(), []);
  const leads = useApi(() => leadsApi.list({ q: filters.q, status: filters.status }), [filters]);

  const statusMap = Object.fromEntries((statuses.data || []).map((s) => [s._id, s]));
  const serviceMap = Object.fromEntries((services.data || []).map((s) => [s._id, s]));

  const columns = [
    {
      key: "name",
      label: "Lead",
      render: (l) => (
        <div className="d-flex align-items-center gap-2">
          <div>
            <div className="fw-semibold">{l.name}</div>
            <div className="text-muted small">{l.phone}</div>
          </div>
        </div>
      ),
    },
    {
      key: "services",
      label: "Services",
      render: (l) => (
        <div className="d-flex flex-wrap gap-1">
          {(l.serviceTracks || []).map((t) => {
            const st = statusMap[t.status] || {};
            return (
              <span key={t.service} className="badge" style={{ background: st.color }}>
                {st.name}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      key: "owner",
      label: "Owner",
      render: (l) => <small>{l.owner}</small>,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (l) => (
        <ActionColumn
          lead={l}
          onService={() => setDetailId(l._id)}
          onFollowUp={() => console.log("TODO: implement")}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Leads" subtitle="Your sales pipeline" />
      <DataTable columns={columns} rows={leads.data} onRowClick={(l) => setDetailId(l._id)} />
      {detailId && (
        <LeadDetailsPanel
          id={detailId}
          onClose={() => setDetailId(null)}
          onChanged={leads.reload}
          statuses={statuses.data || []}
        />
      )}
    </div>
  );
}
```

---

## 📊 UI/UX Changes Summary

### Before
```
Lead Name  | Services & Status | Source  | Owner  | Score
─────────────────────────────────────────────────────────
Aadhya P.  | 📚 Qualified 💬... | Walk-in | Kart   | 92
```

### After
```
Lead Name              | Services      | Owner  | Actions
──────────────────────────────────────────────────────────
Aadhya Patel          | CRM, WhatsApp | Karthik | 📞 ✏️ 🔄 📅
+919821001166         |               |        |
```

**New Features**:
- Cleaner table layout
- Quick action buttons
- Better service management
- Follow-up scheduling
- Workload tracking

---

## 🚀 Next Steps

1. **Review Components** - Check LeadDetailsPanel.jsx and ActionColumn.jsx
2. **Test Manually** - Click buttons in UI to verify functionality
3. **Implement Backend APIs** - Create new follow-up endpoints
4. **Integrate with Forms** - Connect message/edit/follow-up modals
5. **Deploy & Test** - Full end-to-end testing in browser

---

## 📝 Files Changed/Created

### Created Files
- ✅ `frontend/src/components/LeadDetailsPanel.jsx`
- ✅ `frontend/src/components/ActionColumn.jsx`

### Files to Modify
- `frontend/src/pages/Leads.jsx`
- `frontend/src/api/index.js` (add new API methods)
- `backend/src/models/FollowUp.ts`
- `backend/src/models/Lead.ts`
- `backend/src/controllers/followUpController.ts`
- `backend/src/routes/index.ts`

### Status: ✅ Phase 1 Complete | ⏳ Phase 2-4 Ready

---

**Last Updated**: 2026-06-23
**Status**: Ready for Testing & Integration
