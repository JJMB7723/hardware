# Manufacturing & Traceability Management System

A full-stack Academic / Internship Management System for Computer Hardware Manufacturing, Component Fabrication (RAM, ROM, GPU, Motherboard), Finished Product Assembly, Inventory & Stock Movement, Procurement Orders, Logistics Deliveries, Defect Inspection, Customer Returns (RMA), and End-to-End Serial/Batch Traceability.

---

## Technology Stack

- **Frontend**: React.js (Vite), React Router DOM v6, Axios, Lucide Icons
- **Backend**: Node.js, Express.js (Layered REST API)
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM
- **Authentication**: JWT & bcrypt with Admin-only role authorization

---

## Core Modules

1. **Executive Dashboard (`/`)**: 9 KPI summary metric boxes and live chronological activity audit logs.
2. **Product Catalog (`/products`)**: Hardware specifications, unit pricing, real-time inventory balances, and cart addition.
3. **Procurement Cart (`/cart`)**: Unit calculations (`Qty × Price`), quantity adjustments, and formal order checkout.
4. **Order Management (`/orders`)**: Complete status lifecycle (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`), cancellation protections, and delivery synchronization.
5. **Employee Directory (`/employees`)**: Department personnel directory with sector filters (`RAM`, `ROM`, `GPU`, `Motherboard`, `Assembly`, `Inspection`, `Inventory`, `Sales`, `Delivery`, `Administration`).
6. **Stock Management (`/stock`)**: Category inventory (Raw Materials, RAM, ROM, GPU, Motherboard, Finished Products, Quarantine, Rework, Rejected) and audit movement logs.
7. **Manufacturing Subsystem (`/manufacturing`)**: Cleanroom fabrication batches (`GPU-BATCH-001`), production runs with individual component serialization (`GPU-000001`), QA testing, and rework actions.
8. **Assembly Subsystem (`/assembly`)**: Pre-assembly component availability checks (1x RAM, 1x ROM, 1x GPU, 1x Motherboard per PC), compatibility verification, and creation of finished units (`PC-2026-XXXXXX`).
9. **Logistics & Delivery (`/deliveries`)**: Shipment dispatch scheduling and milestone progression tracking (`PACKED` → `SHIPPED` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED`).
10. **Returns, Replacements & Refunds (`/returns`)**: Customer return requests (RMA) with replacement and refund status routing.
11. **Defect Inspection (`/inspections`)**: Defect diagnostic testing, defect classification, and decision recording (`DEFECT CONFIRMED`, `REPAIR`, `REPLACEMENT`, `REFUND`, `REJECT`).
12. **Traceability Ledger (`/traceability`)**: Universal lookup by Product ID, Assembly ID, Component ID, or Batch ID to view the full Bill of Materials (BOM), origin batches, and chronological timeline.
13. **Admin Governance (`/admin-management`)**: Provisioning new administrators with lineage tracking (`created_by`, `created_at`, `last_login_at`).

---

## Quick Start / Local Setup

### 1. Backend API Server Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node prisma/seed.js
npm start
```
The API server runs at `http://localhost:5000`.

### 2. Frontend Application Setup
```bash
cd frontend
npm install
npm run dev
```
The React web application runs at `http://localhost:3000`.

---

## Default Administrator Credentials
- **Email**: `admin@example.com`
- **Password**: `change_this_password`
