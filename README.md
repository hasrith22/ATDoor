# AtDoor — Home Services Marketplace Platform

A complete, production-style full-stack **MERN (MongoDB, Express, React, Node.js) + AI** capstone application built entirely in **JavaScript**.

---

## 🌟 Architecture & Tech Stack

- **Frontend**: React.js (`.jsx`/`.js`), TanStack Router & Start, Tailwind CSS, Lucide Icons, Motion (Framer Motion), Axios.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose schemas, indexes, and aggregations), JWT Bearer authentication, bcryptjs password hashing.
- **AI Engines**:
  - **AI Service Classification**: Free-text problem analysis detecting category, required technical skills, possible issues, and urgency.
  - **AI Provider Recommendation & Scoring Engine**: Hard filters (verification, availability, conflict check, area) + multi-factor ranking (skills match, rating, experience, completed jobs, proximity).

---

## 👥 Five Role-Based Workspaces

1. **Customer** (`/`):
   - Browse dynamic service categories from MongoDB
   - Free-text or photo-driven AI Diagnosis
   - Recommended provider matching
   - Real booking creation and cancellation
   - Live job tracking (`/tracking`)
   - Review submission (with duplicate prevention)
   - Dispute raising
2. **Service Provider** (`/provider`):
   - Jobs workflow: `ASSIGNED` → `ON_THE_WAY` → `STARTED` → `COMPLETED`
   - Before & after service evidence photo attachments
   - Open customer requests feed with quote submission
   - Net earnings breakdown (after 15% platform commission)
3. **Operations Manager** (`/manager`):
   - Operations console with real-time bookings feed
   - Provider assignment & reassignment with audit trail
   - Escalation and service quality monitoring
4. **Support Agent** (`/support`):
   - Dispute tickets, complaints, and cancellations workspace
   - Investigation notes and refund granting/rejection
5. **Platform Admin** (`/admin`):
   - Real-time MongoDB analytics and category revenue breakdown
   - Provider onboarding verification (Approve, Reject with reasons, Suspend)
   - Service category CRUD
   - Authoritative pricing policy rules (base price, emergency fee, weekend multipliers)
   - Cryptographic platform audit logs

---

## 🔑 Demo Accounts (Seeded)

| Role | Email | Password | Quick Link |
|---|---|---|---|
| **Customer** | `customer@atdoor.com` | `Customer@123` | [Customer Dashboard](http://localhost:3000/) |
| **Service Provider** | `provider1@atdoor.com` | `Provider@123` | [Provider Portal](http://localhost:3000/provider) |
| **Operations Manager** | `operations@atdoor.com` | `Ops@123` | [Operations Console](http://localhost:3000/manager) |
| **Support Agent** | `support@atdoor.com` | `Support@123` | [Support Workspace](http://localhost:3000/support) |
| **Platform Admin** | `admin@atdoor.com` | `Admin@123` | [Admin Portal](http://localhost:3000/admin) |

> **Pro Tip**: Use the **Role Switcher** in the top navigation or the 1-Click Demo Buttons on the `/login` page to switch roles instantly!

---

## 🚀 How to Run the Application

### 1. Start the Backend Server

```bash
cd backend
npm install
node seed.js     # Seeds initial users, categories, providers, pricing rules, and bookings
node server.js   # Runs API on http://localhost:5000
```

To run verification tests:
```bash
node test.js     # Executes all 25 automated backend verification tests
```

### 2. Start the Frontend App

```bash
cd frontend
npm install
npm run dev      # Runs dev server on http://localhost:3000
```

---

## 🛡️ Security & Integrity Highlights

- **Bcrypt Hashing**: Passwords are never stored in plain text.
- **Role-Based Authorization (RBAC)**: Backend middleware (`authenticate`, `authorize`) enforces permissions on every private endpoint.
- **State Machine Enforcement**: Transition validation prevents illegal job and booking progression (e.g. `COMPLETED` cannot reverse to `STARTED`).
- **No Duplicate Reviews**: MongoDB compound index and controller checks enforce exactly one review per booking.
- **Authoritative Pricing**: Pricing is always calculated server-side; client-side price tampering is strictly prohibited.
