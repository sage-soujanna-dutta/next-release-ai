# Draw.io Workflow Diagram Guide: MCP Release Notes Generation

## 📋 **How to Create This Diagram in Draw.io**

### **Step 1: Setup Draw.io**
1. Go to https://app.diagrams.net/
2. Create a new blank diagram
3. Choose "Flowchart" template
4. Set canvas to A3 or A2 size for better space

---

## 🎨 **Layer 1: User Interface (Top)**

### **Elements to Add:**
```
┌─────────────────┐    ┌─────────────────┐
│   VS Code       │    │   CLI Interface │
│   Copilot       │    │                 │
└─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
                   │
         ┌─────────────────┐
         │  MCP Client     │
         │  Request        │
         └─────────────────┘
```

**Draw.io Instructions:**
- Add 2 rectangles (rounded corners) for "VS Code Copilot" and "CLI Interface"
- Use **blue color (#2196F3)** for user interface elements
- Add arrows pointing down to "MCP Client Request"
- Use **connector arrows** with labels

---

## 🎨 **Layer 2: MCP Server Core (Center)**

### **Main Server Component:**
```
┌─────────────────────────────────────┐
│         MCP Server                  │
│    release-mcp-server               │
│  ┌─────────────┐ ┌─────────────┐   │
│  │   Request   │ │    Tool     │   │
│  │   Handler   │ │   Router    │   │
│  └─────────────┘ └─────────────┘   │
└─────────────────────────────────────┘
```

**Draw.io Instructions:**
- Large rectangle with **light blue background (#E3F2FD)**
- Add two smaller rectangles inside for "Request Handler" and "Tool Router"
- Use **thick blue border (#1565C0)**

---

## 🎨 **Layer 3: Available MCP Tools (Horizontal Row)**

### **Tools Layout:**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│generate_    │ │create_      │ │fetch_jira_  │ │fetch_github_│
│release_     │ │release_     │ │issues       │ │commits      │
│notes        │ │workflow     │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│publish_to_  │ │validate_    │ │get_sprint_  │ │send_teams_  │
│confluence   │ │configuration│ │status       │ │notification │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

**Draw.io Instructions:**
- Create 8 rectangles in 2 rows of 4
- Use **green color (#4CAF50)** for tool boxes
- Add rounded corners
- Connect from Tool Router to each tool

---

## 🎨 **Layer 4: Service Layer (Vertical)**

### **Services Architecture:**
```
┌─────────────────┐
│ ReleaseNotes    │
│ Service         │ ← Main Orchestrator
│ (Coordinator)   │
└─────────────────┘
         │
    ┌────┼────┬────┼────┬────┼────┐
    │         │         │         │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│ JIRA  │ │GitHub │ │Azure  │ │Other  │
│Service│ │Service│ │DevOps │ │Services│
└───────┘ └───────┘ └───────┘ └───────┘
```

**Draw.io Instructions:**
- Use **green background (#E8F5E8)** for service boxes
- ReleaseNotesService at top (larger box)
- 4 service boxes below connected with arrows
- Use **dark green borders (#2E7D32)**

---

## 🎨 **Layer 5: External Data Sources (Bottom Left)**

### **Data Sources:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   JIRA Cloud    │    │   GitHub API    │    │ Azure DevOps    │
│                 │    │                 │    │      API        │
│ jira.sage.com   │    │ github.com/Sage │    │ dev.azure.com   │
│                 │    │ /sage-connect   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   179 Issues    │    │  2000 Commits   │    │  8 Pipelines    │
│  SCNT-2025-20   │    │ SNA/Release-    │    │  Sprint-21      │
│  SCNT-2025-21   │    │ sprint-2025-21  │    │  Branches       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

**Draw.io Instructions:**
- Use **purple background (#F3E5F5)** for external APIs
- Use **orange background (#FFF3E0)** for data results
- Add **API icons** from draw.io library
- Connect with **dashed arrows**

---

## 🎨 **Layer 6: Data Processing (Center)**

### **Processing Pipeline:**
```
┌─────────────────────────────────────────────┐
│            Data Processing                  │
│                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌──────────┐│
│ │    Data     │→│ Statistics  │→│   Data   ││
│ │ Aggregation │ │ Generation  │ │Validation││
│ └─────────────┘ └─────────────┘ └──────────┘│
└─────────────────────────────────────────────┘
```

**Draw.io Instructions:**
- Large container with **light orange background (#FFF3E0)**
- 3 connected process boxes inside
- Use **process/diamond shapes** for better flow visualization
- **Orange borders (#EF6C00)**

---

## 🎨 **Layer 7: Formatting Layer (Right Side)**

### **Formatters:**
```
┌─────────────────┐    ┌─────────────────┐
│  HtmlFormatter  │    │MarkdownFormatter│
│                 │    │                 │
│ • formatFor     │    │ • format()      │
│   Confluence()  │    │ • clean text    │
│ • ALL commits   │    │ • structured    │
│ • tables        │    │   docs          │
└─────────────────┘    └─────────────────┘
         │                       │
┌─────────────────┐    ┌─────────────────┐
│  Theme Selection│    │  Link Processing│
│ • modern        │    │ • JIRA links    │
│ • minimal       │    │ • GitHub links  │
│ • default       │    │ • Azure links   │
└─────────────────┘    └─────────────────┘
```

**Draw.io Instructions:**
- Use **purple background (#F3E5F5)** for formatter boxes
- Add **bullet points** for features
- Use **purple borders (#7B1FA2)**

---

## 🎨 **Layer 8: Final Outputs (Bottom Right)**

### **Output Files:**
```
┌─────────────────┐    ┌─────────────────┐
│  Confluence     │    │   Markdown      │
│     HTML        │    │     File        │
│                 │    │                 │
│   1.2MB Size    │    │    21KB Size    │
│ ALL 2000 commits│    │ Documentation   │
└─────────────────┘    └─────────────────┘
         │                       │
┌─────────────────┐    ┌─────────────────┐
│ Confluence Page │    │  Teams          │
│                 │    │ Notification    │
│ raj211.atlassian│    │                 │
│      .net       │    │  Summary        │
└─────────────────┘    └─────────────────┘
```

**Draw.io Instructions:**
- Use **pink/red background (#FCE4EC)** for output files
- Add **file icons** from draw.io library
- Use **red borders (#AD1457)**
- Add **size annotations** as text labels

---

## 🎨 **Layer 9: Key Improvements (Annotation)**

### **Features Callout:**
```
┌─────────────────────────────────────────┐
│          🎯 Key Improvements            │
│                                         │
│ ✅ ALL 2000 commits displayed          │
│ ✅ Sprint-21 build branches            │
│ ✅ No 25-commit limit                  │
│ ✅ Complete contributor analytics      │
│ ✅ Real-time pipeline status           │
│ ✅ Enhanced formatting & themes        │
└─────────────────────────────────────────┘
```

**Draw.io Instructions:**
- Use **bright green background (#E0F2F1)**
- **Thick green border (#00695C)**
- Position as a **callout/annotation box**
- Connect with **dotted line** to main workflow

---

## 🎨 **Color Scheme Reference:**

| Component | Background | Border | Text |
|-----------|------------|--------|------|
| User Interface | #E3F2FD | #1565C0 | #0D47A1 |
| MCP Server | #E3F2FD | #1565C0 | #0D47A1 |
| Tools | #E8F5E8 | #2E7D32 | #1B5E20 |
| Services | #E8F5E8 | #2E7D32 | #1B5E20 |
| Data Sources | #F3E5F5 | #7B1FA2 | #4A148C |
| Processing | #FFF3E0 | #EF6C00 | #E65100 |
| Formatters | #F3E5F5 | #7B1FA2 | #4A148C |
| Outputs | #FCE4EC | #AD1457 | #880E4F |
| Improvements | #E0F2F1 | #00695C | #004D40 |

---

## 📐 **Layout Tips for Draw.io:**

### **Canvas Setup:**
1. **Page Size:** A2 or A1 for better visibility
2. **Grid:** Enable grid and snap-to-grid
3. **Layers:** Use layers for better organization

### **Connection Guidelines:**
1. **Solid arrows** for direct data flow
2. **Dashed arrows** for API calls
3. **Dotted lines** for annotations
4. **Curved connectors** to avoid overlaps

### **Text Formatting:**
1. **Bold titles** for main components
2. **Bullet points** for feature lists
3. **Consistent font sizes** (12pt for content, 14pt for titles)
4. **Color coding** text to match backgrounds

### **Spacing:**
1. **Equal spacing** between similar elements
2. **Generous margins** around text
3. **Consistent alignment** (use align tools)

---

## 🚀 **Step-by-Step Creation Process:**

1. **Start with user interface** (top)
2. **Add MCP Server core** (center)
3. **Create tool boxes** (horizontal row)
4. **Add service layer** (vertical column)
5. **Place data sources** (bottom left)
6. **Add processing pipeline** (center flow)
7. **Create formatters** (right side)
8. **Add final outputs** (bottom right)
9. **Add improvement callouts** (annotations)
10. **Connect everything with arrows**
11. **Apply color scheme**
12. **Add labels and annotations**

This guide will help you recreate the exact workflow diagram in draw.io with all the details and visual appeal! 🎨 