# Blinkit Business Intelligence & Reporting Dashboard

An enterprise-grade, full-stack **Blinkit Business Intelligence & Reporting Platform** built with **React 19 (TypeScript, Vite, Tailwind CSS v4, TanStack Query, Recharts, D3.js)** on the frontend and **Node.js (TypeScript, Express, Zod, Joi, pg)** on the backend, powered by a normalized **PostgreSQL** database with real-time analytical aggregations over **103,340 order records**.

🌐 **Live Application URL**: [`http://quantzig.hopto.org`](http://quantzig.hopto.org)

---

## 🏛️ High-Level Architecture

```
React Frontend (Vite + TS + Tailwind CSS v4 + TanStack Query + Recharts + D3.js)
                            │
                            │ (Axios REST API Requests with VITE_API_BASE_URL)
                            ▼
           Express Backend API (Node.js + TS on Port 5001)
 ┌───────────────────────────────────────────────────────────────────────┐
 │ Gzip Compression Middleware (compression)                             │
 │ Joi Security Request Body & Query Validation Middleware              │
 │ Routes (Zod & Joi parameter validation)                               │
 │ Controllers (HTTP response formatting & status handling)              │
 │ Services (Business logic & calculations)                             │
 │ Repositories (Parameterized SQL Queries & Whitelisted ORDER BY Maps)  │
 └───────────────────────────────────────────────────────────────────────┘
                            │
                            │ (pg Connection Pool)
                            ▼
              PostgreSQL Database (`blinkit_db` on Port 5432)
 ┌───────────────────────────────────────────────────────────────────────┐
 │ products, customers, orders, order_items                             │
 │ delivery_performance, customer_feedback                              │
 │ marketing_performance, inventory                                     │
 └───────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features & Enhancements

### 1. Executive BI Dashboard
- **KPI Summary Cards**: Total Revenue, Total Orders, Units Sold, Avg Order Value (AOV), Customer Rating, Active Outlets, SKU Catalog Count, and Total Customers.
- **Daily Sales Trend**: Interactive Recharts Area Chart displaying 90-day gross daily sales timeline with custom glassmorphic tooltips and peak sales day highlighting.
- **Payment Method Distribution**: Interactive D3.js Animated Donut Chart representing revenue breakdown across Cash, Card, and UPI methods.
- **Category Packing Density**: D3.js Pack Layout Bubble Chart with 35px safety margin inset, multi-line `<tspan>` text formatting, glossy radial gradients, and real-time hover metric banner.
- **Revenue by Category Bar Chart**: Recharts Bar Chart with -35° rotated X-axis labels, Lakhs (`₹L`) Y-axis formatting, and hover cell animations.

### 2. 100% PostgreSQL Server-Side Table Sorting
- **SQL Execution**: Server-side sorting powered directly in PostgreSQL via `ORDER BY ${safeSortBy} ${safeSortOrder}` query parameters.
- **Security Whitelisting**: Whitelisted SQL column maps in `backend/src/constants/index.ts` (`PRODUCT_SORT_MAPPING`, `OUTLET_SORT_MAPPING`, `REPORT_SORT_MAPPING`) to prevent SQL injection vulnerabilities.
- **Interactive UI Sorting**: Multi-column header click sorting with direction indicators and explicit `[ ASC ↑ ] [ DESC ↓ ]` pill toggle groups across Product Analytics, Outlet Analytics, and Reports views.
- **Zero Full-Page Reloading**: Integrated TanStack Query `placeholderData: keepPreviousData` to keep table data visible on screen during sorting without destructive full-page spinner reloads.

### 3. Executive PDF Report Export Engine
- **Targeted Section Capture**: Uses `html-to-image` and `jsPDF` to export the actual visual UI layout into crisp, high-DPI vector PDFs.
- **Excluded Navigation Chrome**: Automatically hides `Sidebar`, `TopNav`, `GlobalFilterBar`, and interactive buttons during capture so UI action controls never clutter report output.
- **Executive PDF Styling**: Embeds a Blinkit brand header banner (`blinkit` logo, report title, date/time timestamp, live PostgreSQL sync badge) and `Blinkit Confidential` footer with dynamic `Page X of Y` page numbering.
- **Multi-Page Continuation Slicing**: Slices unconstrained DOM section canvases into A4 PDF pages without text or table row truncation.

### 4. Security & Optimization
- **Joi Validation**: Global request body and query validation middleware ([`validation.middleware.ts`](file:///Users/vijeethsankar/project/blinkit/backend/src/middleware/validation.middleware.ts)) protecting endpoints against malformed parameters.
- **Gzip Payload Compression**: Express Gzip middleware (`compression()`) reducing API response sizes by up to 75%.
- **Frontend Environment Variables**: Parameterized `API_BASE_URL` in [`frontend/.env`](file:///Users/vijeethsankar/project/blinkit/frontend/.env) using `import.meta.env.VITE_API_BASE_URL`.
- **Knowledge Graph Integration**: Integrated Graphify codebase knowledge graph ([`graphify-out/`](file:///Users/vijeethsankar/project/blinkit/graphify-out/)) mapping 328 AST code nodes, 565 edges, and 19 communities.

---

## ☁️ AWS Free Tier EC2 Deployment Setup

The repository includes production containerization and automated one-click deployment scripts for **AWS Free Tier EC2**:

- **Official Live Domain**: [`http://quantzig.hopto.org`](http://quantzig.hopto.org)
- **Standard HTTP Port**: `80`
- **Backend API Port**: `5001`
- **PostgreSQL Port**: `5432`
- **Automated Deployment Script**: [`deploy.sh`](file:///Users/vijeethsankar/project/blinkit/deploy.sh)
- **Comprehensive EC2 Setup Guide**: [`AWS_DEPLOYMENT.md`](file:///Users/vijeethsankar/project/blinkit/AWS_DEPLOYMENT.md)
- **Docker Compose Setup**: [`docker-compose.yml`](file:///Users/vijeethsankar/project/blinkit/docker-compose.yml) (PostgreSQL 16 + Express API + Nginx SPA Reverse Proxy)

### Quick One-Click EC2 Deployment:
```bash
# 1. SSH into your AWS EC2 instance
ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# 2. Clone repo and switch to dev branch
git clone https://github.com/vijeeth-pro/blinkit-dashboard.git
cd blinkit-dashboard
git checkout dev

# 3. Run one-click deployment script
chmod +x deploy.sh
./deploy.sh
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Routing**: React Router v7 (`react-router-dom`)
- **State & Data Fetching**: TanStack Query (`@tanstack/react-query`)
- **Data Visualization**: Recharts (`recharts`) + D3.js (`d3`)
- **PDF & CSV Export**: `html-to-image` + `jspdf` + custom CSV streaming utility
- **HTTP Client**: Axios (`axios`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) + Lucide Icons (`lucide-react`)

### Backend
- **Runtime**: Node.js v22 (ES Modules)
- **Language**: TypeScript v5 (`tsx`)
- **Framework**: Express.js v4
- **Security & Validation**: Joi (`joi`) + Zod (`zod`)
- **Compression**: `compression` (Gzip)
- **Database Driver**: `pg` (PostgreSQL Connection Pool)
- **Data Ingestion**: `csv-parser` for high-throughput ETL data pipelines

### Database
- **Database Engine**: PostgreSQL (`blinkit_db`)
- **Schema Design**: 8 Relational Tables with B-Tree Indexes on `order_date`, `category`, `customer_segment`, `payment_method`, `delivery_status`, `rating`.

---

## 📊 Dataset & Ingestion Pipeline

The platform includes an automated ETL data ingestion pipeline (`npm run import-data` in `backend/`):

- **Products**: 268 SKUs (`products`)
- **Customers**: 2,500 Registered Buyers (`customers`)
- **Orders**: 5,000 Order Transactions (`orders`)
- **Order Items**: 5,000 Order Line Items (`order_items`)
- **Delivery Performance**: 5,000 Delivery Records (`delivery_performance`)
- **Customer Feedback**: 5,000 Ratings & Sentiments (`customer_feedback`)
- **Marketing Performance**: 5,400 Campaign Records (`marketing_performance`)
- **Inventory**: 75,172 Stock Records (`inventory`)
- **Total Ingested Records**: **103,340 rows** aggregated in real-time.

---

## 🚀 Local Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL server running locally on port `5432`

### 1. Database Creation
Create the PostgreSQL database `blinkit_db`:
```bash
psql -U postgres -c "CREATE DATABASE blinkit_db;"
```

### 2. Ingest Dataset into PostgreSQL
```bash
cd backend
npm run import-data
```

### 3. Environment Setup
#### Backend (`backend/.env`):
```env
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/blinkit_db
```

#### Frontend (`frontend/.env`):
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

### 4. Start Development Servers
From project root directory:
```bash
# Start backend server (Port 5001)
npm run dev:backend

# Start frontend client (Port 5173) in a second terminal
npm run dev:frontend
```

---

## 🧪 Automated Testing

Run backend database sorting tests:
```bash
cd backend
npx tsx src/scripts/testSorting.ts
```

Run frontend PDF export unit tests:
```bash
cd frontend
npx tsx src/scripts/testPdfExport.ts
```

---

## 🔌 REST API Reference

| Endpoint | Method | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | — | Health check & server status |
| `/api/dashboard/summary` | `GET` | `paymentMethod`, `deliveryStatus`, `customerSegment` | Executive KPIs, sales trend, category & payment breakdowns |
| `/api/sales/analytics` | `GET` | `paymentMethod`, `deliveryStatus`, `customerSegment` | Monthly sales growth & delivery delay metrics |
| `/api/products/analytics` | `GET` | `sortBy`, `sortOrder`, `paymentMethod`, etc. | Top products matrix with PostgreSQL server-side sorting |
| `/api/outlets/analytics` | `GET` | `sortBy`, `sortOrder`, `paymentMethod`, etc. | Dark store hub matrix with PostgreSQL server-side sorting |
| `/api/reports/sales` | `GET` | `page`, `limit`, `sortBy`, `sortOrder`, `search` | Server-side paginated & filtered sales report |
| `/api/reports/export` | `GET` | `paymentMethod`, `deliveryStatus`, `customerSegment`, `search` | Direct streaming CSV file export |

---

## 📄 License
MIT License.
