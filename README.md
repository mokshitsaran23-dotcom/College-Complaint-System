# College Complaint System — Enterprise Scrum Implementation

An enterprise digital complaint submission, assignment, tracking, and reporting platform engineered for higher education institutions. Built strictly according to the Jira backlog specification (`Scrum_02_Jira_Import.csv`, Epic `scrum-02`).

---

## 🏛️ System Architecture Overview

The system replaces informal, fragmented complaint channels (WhatsApp groups, verbal complaints, phone calls) with an auditable, real-time reactive workflow.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│   React 18 + TypeScript + Tailwind CSS (Vite Bundler & Dev Server)     │
│   • Student Portal (Complaint Submission, Photo Upload, Tracking)      │
│   • Admin Portal (Queue Triage, Department Routing, Reporting Charts)   │
│   • Maintenance Staff Portal (Department Work Order View, Status Update)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST + WebSockets (Socket.io)
┌───────────────────────────────────▼────────────────────────────────────┐
│                           API GATEWAY / BACKEND                        │
│   Node.js + Express + Socket.io Server                                 │
│   • Stubbed Institutional SSO / LDAP Identity Provider                 │
│   • JWT Authentication & Role-Based Access Control (RBAC) Guard        │
│   • Complaint Lifecycle State Machine (Open ➔ Assigned ➔ In Progress)  │
│   • Real-Time Push Notification Engine & In-App Delivery Log           │
│   • Aggregation Engine for KPI & Trend Reporting                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose ODM
┌───────────────────────────────────▼────────────────────────────────────┐
│                           PERSISTENCE LAYER                            │
│   MongoDB 7.0                                                          │
│   • Complaints Collection (Reference ID, Submitter, Category, Photos)   │
│   • StatusHistory Collection (Append-Only Immutable State Audit Log)   │
│   • Feedback Collection (Star Rating 1-5, Comments, Resolution Link)   │
│   • Users Collection (Roles: Student, Staff, Admin)                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
College-Complaint-System/
├── .gitignore                      # Standard production exclusions
├── .gitattributes                 # Cross-platform line endings & binary filters
├── README.md                       # Master architecture and setup guide (this file)
├── docs/                           # Architecture, specs, ERD, and contracts
│   ├── system-architecture.md      # Detailed multi-tier architectural breakdown
│   ├── api-contract-spec.md        # Comprehensive REST endpoints contract
│   ├── database-erd.md             # Schema diagrams and relationship specs
│   ├── state-machine-lifecycle.md  # Complaint lifecycle transition validation
│   ├── rbac-security-model.md      # Role permissions matrix
│   └── traceability-matrix.md      # Jira ID to code/test/branch traceability
├── frontend/                       # Integrated production React + TS application
├── backend/                        # Integrated production Node.js + Express API
├── database/                       # Mongoose schemas, connection, and seed scripts
├── scrums/                         # 23 isolated task folders (4 Epics + 19 Stories)
│   ├── SCRUM02-F001_Digital_Complaint_Submission/
│   ├── SCRUM02-F002_Complaint_Assignment_Routing/
│   ├── SCRUM02-F003_Status_Tracking_Notifications/
│   ├── SCRUM02-F004_Feedback_Admin_Reporting/
│   └── E2E/
└── Final_Release/                  # Production Docker Compose and release scripts
```

---

## 🌿 Git Branch ↔ Jira ID Mapping

Every story corresponds strictly to its dedicated feature branch and Jira commit message:

| # | Feature Branch | Jira Story ID | Jira Summary |
|---|----------------|---------------|--------------|
| 1 | `feature/SCRUM-6-complaint-form` | `SCRUM02-F001-UI-001` | Complaint submission form |
| 2 | `feature/SCRUM-7-authentication` | `SCRUM02-F001-UI-002` | Login using college credentials |
| 3 | `feature/SCRUM-8-complaint-api` | `SCRUM02-F001-BE-001` | Complaint creation API |
| 4 | `feature/SCRUM-9-authentication-service` | `SCRUM02-F001-BE-002` | Authentication integration service |
| 5 | `feature/SCRUM-10-complaint-database` | `SCRUM02-F001-DB-001` | Complaint data store |
| 6 | `feature/SCRUM-11-admin-queue` | `SCRUM02-F002-UI-001` | Admin complaint queue & assignment screen |
| 7 | `feature/SCRUM-12-staff-view` | `SCRUM02-F002-UI-002` | Maintenance staff assigned-complaints view |
| 8 | `feature/SCRUM-13-assignment-api` | `SCRUM02-F002-BE-001` | Complaint assignment API |
| 9 | `feature/SCRUM-14-status-tracking` | `SCRUM02-F003-UI-001` | Complaint status tracking screen |
| 10 | `feature/SCRUM-15-status-update` | `SCRUM02-F003-UI-002` | Maintenance staff status update control |
| 11 | `feature/SCRUM-16-notification-service` | `SCRUM02-F003-BE-001` | Complaint status update & notification trigger service |
| 12 | `feature/SCRUM-17-status-history` | `SCRUM02-F003-DB-001` | Complaint status history table |
| 13 | `feature/SCRUM-18-feedback-form` | `SCRUM02-F004-UI-001` | Post-resolution feedback form |
| 14 | `feature/SCRUM-19-reporting-dashboard` | `SCRUM02-F004-UI-002` | Admin reporting dashboard |
| 15 | `feature/SCRUM-20-feedback-api` | `SCRUM02-F004-BE-001` | Feedback capture API |
| 16 | `feature/SCRUM-21-reporting-api` | `SCRUM02-F004-BE-002` | Reporting/aggregation API |
| 17 | `feature/SCRUM-22-feedback-database` | `SCRUM02-F004-DB-001` | Feedback data store |
| 18 | `feature/SCRUM-23-student-complaint-flow` | `SCRUM02-E2E-001` | Student submits → admin assigns → tracked to resolution |
| 19 | `feature/SCRUM-24-resolved-complaint-feedback` | `SCRUM02-E2E-002` | Resolved complaint collects feedback that feeds admin reporting |

---

## ⚡ Quick Start: Running the Integrated System

### Prerequisites
- Node.js >= 18 (Tested on Node 24)
- MongoDB instance running on `mongodb://localhost:27017/college_complaints` (or run via Docker Compose in `Final_Release/`)

### 1. Database Seeding
```bash
cd database
npm install
npm run seed
```

### 2. Launch Backend API Server
```bash
cd ../backend
npm install
npm start
# Server boots on http://localhost:5000 with real-time Socket.io
```

### 3. Launch Frontend Client
```bash
cd ../frontend
npm install
npm run dev
# Vite dev server opens on http://localhost:5173
```

### 4. Or Launch Everything with Docker Compose
```bash
cd Final_Release
docker-compose up --build
```

---

## 🧪 Testing

Every task under `scrums/` contains its own self-contained test suite matching 100% of the Jira Acceptance Criteria:

```bash
# Example: running tests for Complaint Creation API
cd scrums/SCRUM02-F001_Digital_Complaint_Submission/SCRUM02-F001-BE-001_Complaint_Creation_API
npm test

# Example: running E2E flow tests
cd scrums/E2E/SCRUM02-E2E-001_Submit_Assign_Track_To_Resolution
npm test
```

---

## 🔐 Demo Credentials

| Role | College ID | Password | Access / Scope |
|------|------------|----------|----------------|
| **Student** | `STU101` | `student123` | Submit complaints, view personal status timeline, submit feedback |
| **Admin** | `ADM001` | `admin123` | View all complaints, assign/reassign departments, access reporting dashboard |
| **Staff (Electrical)** | `STF201` | `staff123` | View Electrical department tickets, update status (Assigned ➔ In Progress ➔ Resolved) |
| **Staff (Plumbing)** | `STF202` | `staff123` | View Plumbing department tickets, update status |
| **Staff (IT Support)** | `STF203` | `staff123` | View IT Support department tickets, update status |
