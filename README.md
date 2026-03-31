<div align="center">

# ⚡ Antigravity CRM

**A modern, full-stack Sales Analytics CRM built with Next.js 16, Prisma 7 & PostgreSQL**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.6-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)

</div>

---

![Dashboard](screenshots/dashboard.png)

## ✨ Features

### 📊 Real-Time Dashboard
- Live KPI widgets — Total Leads, Active Deals, Revenue, Conversion Rate
- Interactive revenue trend chart (last 7 days) with Recharts
- Lead source distribution donut chart
- Conversion funnel visualization

### 👥 Lead Management
- Full CRUD operations — create, edit, delete leads
- Bulk CSV import via PapaParse
- Search & filter by name, email, phone
- Status tracking (New → Contacted → Interested → Converted → Lost)
- Priority levels (Low / Medium / High)

### 💰 Sales & Invoicing
- Transaction ledger with revenue summaries
- Payment status tracking (Paid / Pending / Refunded)
- Agent attribution per sale
- Product-linked invoicing

### 🛍️ Product Catalog
- Product management with pricing, currency & duration
- Active/Inactive status control
- Bulk CSV import support

### 👤 Agent Management (Admin Panel)
- Full agent CRUD with role-based access (Agent / Admin)
- Per-agent performance metrics — leads, sales, revenue
- Sale creation with assignment validation (agents can only sell to their assigned leads)
- Real-time status updates on sales

### 📈 Performance Analytics
- Agent leaderboard with conversion rates
- Revenue per agent breakdown
- Lead assignment sub-tables per agent

### 🎯 Lead Assignment Queue
- Unassigned lead queue with agent load balancing
- Visual agent workload bars
- One-click assignment with confirmation

### ⚙️ Settings
- Application configuration dashboard
- System info — version, framework, database, ORM

---

## 📸 Screenshots

<details>
<summary><strong>🏠 Dashboard</strong></summary>

![Dashboard](screenshots/dashboard.png)

</details>

<details>
<summary><strong>👥 Leads Management</strong></summary>

![Leads](screenshots/leads.png)

</details>

<details>
<summary><strong>👤 Agent Management</strong></summary>

![Agents](screenshots/agents.png)

</details>

<details>
<summary><strong>⚙️ Settings</strong></summary>

![Settings](screenshots/settings.png)

</details>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Framer Motion, Lucide Icons |
| **Charts** | Recharts |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7 (with `@prisma/adapter-pg`) |
| **Styling** | CSS Variables (dark theme) |
| **CSV Parsing** | PapaParse |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** running locally or remotely
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/jafar/crm-app.git
cd crm-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/CRM"
```

### 4. Set Up the Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma db push

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

### 5. Start the Dev Server

```bash
npm run dev
```

The app will be running at **http://localhost:3010**

---

## 📁 Project Structure

```
crm-app/
├── prisma/
│   └── schema.prisma          # Database schema (Agent, Lead, Product, Sale, Call, AuditLog)
├── src/
│   ├── app/
│   │   ├── page.tsx            # Dashboard
│   │   ├── leads/              # Lead management
│   │   ├── sales/              # Sales ledger
│   │   ├── products/           # Product catalog
│   │   ├── agents/             # Agent admin panel
│   │   ├── performance/        # Agent analytics
│   │   ├── assign/             # Lead assignment queue
│   │   ├── settings/           # App settings
│   │   ├── actions/            # Server Actions (all backend logic)
│   │   │   ├── agents.ts
│   │   │   ├── leads.ts
│   │   │   ├── sales.ts
│   │   │   ├── products.ts
│   │   │   ├── assign.ts
│   │   │   ├── performance.ts
│   │   │   └── dashboard.ts
│   │   ├── layout.tsx
│   │   └── globals.css         # Design system (CSS variables)
│   ├── components/
│   │   ├── Sidebar.tsx          # Collapsible navigation
│   │   ├── Topbar.tsx           # Page header with search
│   │   └── DashboardCharts.tsx  # Recharts wrappers
│   ├── services/
│   │   ├── agent.service.ts     # Agent data access layer
│   │   └── lead.service.ts      # Lead data access layer
│   └── lib/
│       └── db.ts                # Prisma client singleton
├── screenshots/                 # README screenshots
├── package.json
├── next.config.ts
└── tsconfig.json
```

---

## 📐 Database Schema

```
Agent ──┐
        ├── Lead (assigned)
        ├── Sale (recorded by)
        ├── Call (made by)
        └── AuditLog

Lead ───┐
        ├── Sale (converted)
        └── Call (tracked)

Product ── Sale (purchased)
```

**Key Relations:**
- Leads are assigned to Agents (`assignedAgentId`)
- Sales link a Lead + Agent + Product
- Cascade deletion: deleting a Lead removes its Sales and Calls
- Agents have roles: `AGENT` or `ADMIN`

---

## 🔒 Business Rules

- **Sale Assignment Validation**: Only the assigned agent (or an Admin) can record a sale for a lead
- **Cascade Deletion**: Deleting a lead automatically removes associated sales and calls
- **Lead Ownership**: Lead assignment is preserved during sale creation — no auto-reassignment

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3010 |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open database GUI |
| `npx prisma db push` | Sync schema to database |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary.

---

<div align="center">

**Built with ❤️ using Next.js, Prisma & PostgreSQL**

</div>
