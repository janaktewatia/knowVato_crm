# UI/UX Mockups - New CRM Design

## 📊 Lead List with Action Column

### Current View (Before)
```
┌────────────────────────────────────────────────────────────────┐
│ Leads › Search [____] Status [All ▼] Reset                     │
├────────────────────────────────────────────────────────────────┤
│ LEAD              │ SERVICES & STATUS  │ SOURCE  │ OWNER        │
├────────────────────────────────────────────────────────────────┤
│ Aadhya Patel      │ 📚 Qualified       │ Walk-in │ Karthik      │
│ +919821001166     │ 💬 In Conversation │         │              │
│                   │ 📅 Registered      │         │              │
├────────────────────────────────────────────────────────────────┤
│ Sai Sharma        │ 📚 New             │ WhatsApp│ Priya        │
│ +919182009384     │                    │         │              │
├────────────────────────────────────────────────────────────────┤
│ Kiara Iyer        │ 📚 Admitted ✓      │ Website │ Ananya       │
│ +919182008602     │ 📅 Attended ✓      │         │              │
└────────────────────────────────────────────────────────────────┘
```

### New View (After) ✨
```
┌───────────────────────────────────────────────────────────────────┐
│ Leads › Search [____] Status [All ▼] Reset                        │
├───────────────────────────────────────────────────────────────────┤
│ LEAD              │ SERVICES   │ OWNER    │ ACTIONS               │
├───────────────────────────────────────────────────────────────────┤
│ Aadhya Patel      │ CRM        │ Karthik  │ 📞 ✏️ 🔄 📅         │
│ +919821001166     │ WhatsApp   │          │                       │
│                   │ Events     │          │                       │
├───────────────────────────────────────────────────────────────────┤
│ Sai Sharma        │ CRM        │ Priya    │ 📞 ✏️ 🔄 📅         │
│ +919182009384     │            │          │                       │
├───────────────────────────────────────────────────────────────────┤
│ Kiara Iyer        │ CRM        │ Ananya   │ 📞 ✏️ 🔄 📅         │
│ +919182008602     │ Events     │          │                       │
└───────────────────────────────────────────────────────────────────┘
```

### Action Buttons Hover/Click
```
Hovering on a row shows:
📞 = Send Message     (Opens message modal)
✏️ = Edit Lead        (Opens edit form)
🔄 = Service/Status   (Expands service panel)
📅 = Follow-up        (Opens schedule follow-up)
```

---

## 📱 Lead Detail Panel - Full View

### New LeadDetailsPanel Layout

```
┌──────────────────────────────────────────────────┐
│ × Aadhya Patel                                   │
│   +919821001166 · aadhya@example.com            │
├──────────────────────────────────────────────────┤
│ [📞 Message] [✏️ Edit] [🔄 Service] [📅 F-up] │
├──────────────────────────────────────────────────┤
│ SERVICES & STATUSES                              │
│                                                   │
│ ┌──────────────────┬──────────────────────────┐  │
│ │ SERVICE (LEFT)   │ STATUS (RIGHT)           │  │
│ ├──────────────────┼──────────────────────────┤  │
│ │ 📚 Admissions CRM│ [Qualified] ▼            │  │
│ │ ↳ 25/06/2026     │                          │  │
│ │ (Remove ×)       │                          │  │
│ ├──────────────────┼──────────────────────────┤  │
│ │ 💬 WhatsApp      │ [In Conversation] ▼      │  │
│ │ ↳ 24/06/2026     │                          │  │
│ │ (Remove ×)       │                          │  │
│ ├──────────────────┼──────────────────────────┤  │
│ │ 📅 Event Mgmt    │ [Registered] ▼           │  │
│ │ ↳ 30/07/2026     │                          │  │
│ │ (Remove ×)       │                          │  │
│ ├──────────────────┼──────────────────────────┤  │
│ │ [+ Add Service ▼]│                          │  │
│ └──────────────────┴──────────────────────────┘  │
│                                                   │
├──────────────────────────────────────────────────┤
│ SCHEDULE FOLLOW-UP                               │
│                                                   │
│ Type:      [☎️ Call] ▼                           │
│ Date:      [25/06/2026] ▼                        │
│ Time:      [10:00] ▼                             │
│ Assign to: [Karthik Iyer] ▼                      │
│                                                   │
│ Remark:                                          │
│ ┌────────────────────────────────────────────┐  │
│ │ Discuss fee structure and admission...     │  │
│ └────────────────────────────────────────────┘  │
│                                                   │
│ 📊 Workload: 5/20 slots filled                  │
│    [████░░░░░░░░░░░░] 25% capacity             │
│                                                   │
│ [Schedule Follow-up] [Cancel]                    │
│                                                   │
├──────────────────────────────────────────────────┤
│ LEAD INFORMATION                                 │
│ Source:    Walk-in                              │
│ Course:    Class IX Admission                   │
│ Owner:     Karthik Iyer                         │
│ Value:     ₹32,947                              │
│                                                   │
├──────────────────────────────────────────────────┤
│ ACTIVITY                                         │
│                                                   │
│ [Log a note...] [Add]                           │
│                                                   │
│ • Discuss fee structure (today, 10:30)         │
│   by Karthik Iyer                              │
│                                                   │
│ • Fee concession asked (yesterday, 14:20)      │
│   by Priya Kothari                             │
│                                                   │
│ • Status changed to Qualified (2 days ago)     │
│   by Ananya Saxena                             │
│                                                   │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Key UI Improvements

### 1. Service & Status Layout

#### BEFORE (Cramped)
```
┌────────────────────────────────┐
│ 📚 Qualified 💬 In-Conv 📅...  │
│ All crammed in one line        │
└────────────────────────────────┘
```

#### AFTER ✨ (Clear & Organized)
```
┌──────────────────┬──────────────────────┐
│ 📚 Admissions CRM│ [Qualified] ▼        │
│ 💬 WhatsApp      │ [In Conversation] ▼  │
│ 📅 Event Mgmt    │ [Registered] ▼       │
└──────────────────┴──────────────────────┘
```

**Benefits**:
- Clear visual separation
- Service names are readable
- Status is interactive (dropdown)
- Easy to manage per service
- Next follow-up dates visible

### 2. Action Column

#### BEFORE
```
Click row → Full panel opens → Find desired action
```

#### AFTER ✨
```
See row → Click icon directly
📞 for message
✏️ for edit
🔄 for service
📅 for follow-up
```

**Benefits**:
- Quick actions visible
- No need to open full panel
- Faster workflow
- Permission-based visibility

### 3. Follow-up Scheduling

#### BEFORE
```
Create follow-up in separate Follow-up page
No context about the lead
No workload information
Manual workload tracking
```

#### AFTER ✨
```
Schedule directly from lead panel
Full lead context visible
See assigned person's workload
Know their available capacity
Auto-sync with Follow-up page
```

---

## 💬 Follow-up Types with Icons

### Call (☎️)
```
Type:    [☎️ Call] ▼
Time:    [10:00] ▼
Date:    [25/06/2026] ▼
Remark:  Discuss fee structure
```

### Email (📧)
```
Type:    [📧 Email] ▼
Subject: [______________]
Body:    [_______________]
Remark:  Send admission details
```

### WhatsApp (💬)
```
Type:    [💬 WhatsApp] ▼
Time:    [10:00] ▼
Date:    [25/06/2026] ▼
Remark:  Send prospectus link
```

### SMS (📱)
```
Type:    [📱 SMS] ▼
Time:    [10:00] ▼
Date:    [25/06/2026] ▼
Remark:  Quick reminder
```

---

## 👥 Workload Indicator Examples

### Low Load (Green)
```
Karthik Iyer: 3/20 follow-ups
[███░░░░░░░░░░░░░░░] 15% capacity ✓
Status: Available
```

### Medium Load (Yellow)
```
Priya Kothari: 12/20 follow-ups
[█████████████░░░░░] 60% capacity ⚠️
Status: Busy but available
```

### High Load (Red)
```
Ananya Saxena: 19/20 follow-ups
[████████████████░░] 95% capacity ✗
Status: At capacity - recommend reassignment
```

---

## 📋 Form Field Examples

### Follow-up Type Selector
```
Type: [☎️ Call] ▼
     ├─ ☎️ Call
     ├─ 📧 Email
     ├─ 💬 WhatsApp
     └─ 📱 SMS
```

### Assign To with Workload
```
Assign to: [Karthik Iyer] ▼
          ├─ ☎️ Karthik Iyer (5 pending, 15 slots free)
          ├─ 📊 Priya Kothari (8 pending, 12 slots free)
          ├─ 👤 Ananya Saxena (2 pending, 18 slots free)
          └─ 💼 Rahul Bhatt (10 pending, 10 slots free)
```

### Date & Time Pickers
```
Date: [25/06/2026] ▼
      Calendar opens with:
      - Today highlighted
      - Weekend indicators
      - Next follow-up dates marked

Time: [10:00] ▼
      Time picker with 30-min intervals:
      - 09:00
      - 09:30
      - 10:00 ← Selected
      - 10:30
      - etc.
```

---

## 🎨 Color Coding

### Service Colors
```
📚 Admissions CRM    → #0085a8 (Blue)
💬 WhatsApp          → #25d366 (Green)
📅 Event Management  → #7c3aed (Purple)
```

### Status Colors
```
🔵 New               → #2563eb (Blue)
🟣 Qualified         → #7c3aed (Purple)
🟠 Visit Booked      → #d97706 (Orange)
🟡 Negotiation       → #ca8a04 (Amber)
🟢 Admitted ✓        → #00a884 (Green)
🔴 Lost ✕            → #dc2626 (Red)
```

### Follow-up Type Colors
```
☎️ Call              → #3b82f6 (Blue)
📧 Email             → #8b5cf6 (Purple)
💬 WhatsApp          → #10b981 (Green)
📱 SMS               → #f59e0b (Amber)
```

---

## 🔄 User Interaction Flow

### Scenario 1: Quick Message Send
```
1. See lead in list
2. Click 📞 icon → Message modal opens
3. Select channel (WhatsApp/Email)
4. Type message or select template
5. Send
6. Back to list
```

### Scenario 2: Schedule Follow-up
```
1. Click 📅 icon (or open panel)
2. Follow-up form appears
3. Select type (Call/Email/WA/SMS)
4. Pick date and time
5. Assign to person
6. Add remark
7. Click Schedule
8. Auto-syncs to Follow-up page
```

### Scenario 3: Change Service Status
```
1. Click row → Panel opens
2. See service in left column
3. See status dropdown on right
4. Click dropdown
5. Select new status
6. Auto-saves
7. Lead status updated
```

---

## 📱 Responsive Design

### Desktop (Full)
```
┌─────────────────────────────────────┐
│ Lead Name     | Services | Actions  │
│ Service-status in 2-col layout      │
│ Follow-up form with all fields      │
└─────────────────────────────────────┘
```

### Tablet
```
┌──────────────────────────┐
│ Lead Name | Services    │
│ Actions stacked         │
│ Follow-up form compact  │
└──────────────────────────┘
```

### Mobile
```
┌─────────────────┐
│ Lead Name       │
│ [📞][✏️][🔄][📅]│
│ Service/Status  │
│ Follow-up form  │
└─────────────────┘
```

---

## ✨ Summary of Visual Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Action Access** | Open full panel | Quick icons |
| **Service Layout** | Compressed in one line | Organized 2-column |
| **Status Change** | Click status buttons | Dropdown selector |
| **Follow-up Type** | Only in Follow-up page | In lead panel |
| **Workload Info** | Not visible | Shows capacity & load |
| **Next Follow-up** | Not shown per service | Shows with service |
| **Visual Clarity** | Cramped | Spacious & organized |
| **User Speed** | Slower (full panel) | Faster (quick actions) |

---

**Visual Design Status**: ✅ Ready for Implementation  
**Component Status**: ✅ Components Created  
**Integration Status**: ⏳ Ready to Integrate  
**Testing Status**: ⏳ Ready to Test
