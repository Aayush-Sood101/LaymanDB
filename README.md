# LaymanDB

LaymanDB is an AI-powered database design platform that transforms natural language descriptions into professional database schemas. It bridges the gap between conceptual thinking and technical implementation, empowering both developers and non-technical stakeholders to create sophisticated database designs without writing a single line of SQL.

By combining Google Gemini AI with interactive visualization tools, LaymanDB streamlines the entire database design process—from initial concept to implementation-ready SQL scripts and comprehensive documentation.

> **Live App**: [https://layman-db.vercel.app](https://layman-db.vercel.app)

---

## Table of Contents

1. [Key Features](#key-features)
2. [Why LaymanDB?](#why-laymandb)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Running the Application](#running-the-application)
6. [Usage Guide](#usage-guide)
7. [Pricing & Credits](#pricing--credits)
8. [Authentication](#authentication)
9. [API Routes](#api-routes)
10. [Component Reference](#component-reference)
11. [Sample Inputs](#sample-inputs)
12. [Common Issues & Solutions](#common-issues--solutions)
13. [License](#license)

---

## Key Features

### 🤖 AI-Powered Schema Generation (Google Gemini)
LaymanDB uses **Google Gemini** to process natural language descriptions and generate complete, normalized database schemas. Simply describe your requirements in plain English—no SQL knowledge required.

### 🔄 Two-Step AI Refinement Loop
Before generating the final schema, LaymanDB runs a two-step AI pipeline:
1. **Prompt Enhancement** – Gemini analyzes and enriches your initial description, surfacing missing details and clarifying ambiguities.
2. **Prompt Optimization** – A second pass further refines the prompt for the most accurate schema output.

This "human-in-the-loop" approach produces schemas that are more complete and accurate than a single-pass system.

### 📊 Interactive ERD Visualization (ReactFlow)
The generated schema is rendered as a fully interactive **Entity-Relationship Diagram** using ReactFlow:
- Drag and reposition entities freely on the canvas
- Zoom, pan, and focus on specific areas of complex schemas
- Automatic node placement for optimal readability
- Visual indicators for relationship types and cardinality (1:1, 1:N, N:M)

### 🗄️ Multi-Dialect SQL Export
Export production-ready SQL for multiple database engines from a single design:
- **PostgreSQL**
- **MySQL**
- **SQLite**
- **SQL Server**

All SQL output is formatted for readability using `sql-formatter`, with proper indexes, foreign keys, and constraints.

### 📐 Mermaid ER Diagram Export
Export your schema as **Mermaid syntax** for seamless embedding in:
- GitHub/GitLab Markdown files
- Wikis and Confluence pages
- Any documentation tool that supports Mermaid

Diagrams can be previewed live within the application before exporting.

### 📝 Intelligent Context-Aware Documentation
Automatically generate comprehensive **Markdown documentation** that includes:
- Detailed descriptions of every entity and its attributes
- Explanations of each relationship and its cardinality
- Design rationale derived from your original natural language input
- Embedded Mermaid diagrams for visual reference

### 🖼️ Diagram Image Export
Export your ERD as a **PNG image** using `html-to-image`, ready for presentations, reports, or archival.

### 💬 Gemini Playground
An interactive chat-style playground where you can ask Gemini questions about your schema, explore design decisions, or iterate on ideas in a conversational interface.

### 🔒 Session & Schema History
- Your schema is persisted in the application session
- A **Session History** panel lets you view and restore previous schema generations within the same session

---

## Why LaymanDB?

| Aspect | Benefit |
|---|---|
| **Non-technical users** | Business analysts and product managers can design schemas without SQL knowledge |
| **Speed** | Go from idea to a deployable schema in minutes, not hours |
| **Multi-database** | One design, multiple SQL dialects—no manual translation |
| **Documentation** | Auto-generated docs keep stakeholders aligned at every level |
| **Education** | High-fidelity ERDs follow academic ER modeling standards, making LaymanDB a useful learning tool |
| **Collaboration** | Shareable exports (SQL, Mermaid, PNG, Markdown) fit naturally into any team's workflow |

---

## Tech Stack

### Frontend (this repository)

| Technology | Purpose |
|---|---|
| **Next.js 15** (App Router) | Full-stack React framework with server-side API routes |
| **React 19** | UI rendering |
| **ReactFlow 11** | Interactive ERD canvas and node editor |
| **Mermaid.js 11** | Mermaid diagram rendering and preview |
| **Tailwind CSS v4** | Utility-first styling |
| **Framer Motion** | Page transitions and animations |
| **Clerk** | User authentication (sign-up, sign-in, session management) |
| **Razorpay** | One-time credit pack payments |
| **sql-formatter** | SQL output formatting |
| **html-to-image** | PNG diagram export |
| **Vercel Analytics** | Page-level performance analytics |
| **Vercel Speed Insights** | Core Web Vitals monitoring |
| **@paper-design/shaders-react** | Background shader animations on the landing page |
| **Spline** | 3D hero scene rendering |
| **Radix UI** | Accessible dialog, dropdown, tooltip primitives |
| **D3.js** | Supplementary data visualization utilities |

### Backend (separate service)

The frontend proxies all `/api/*` requests to a separate backend server defined by `NEXT_PUBLIC_BACKEND_URL`.

| Technology | Purpose |
|---|---|
| **Node.js + Express** | RESTful API server |
| **Google Gemini AI** | Schema generation, prompt enhancement, optimization |
| **MongoDB** | Schema and session storage |
| **Mongoose** | MongoDB ODM |
| **Winston** | Structured logging |

---

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│              Browser (Client)               │
│  Next.js App (React 19, ReactFlow, Mermaid) │
│  Authentication: Clerk                      │
│  Payments: Razorpay                         │
└──────────────┬──────────────────────────────┘
               │  HTTP / Next.js API Routes
               │  (/api/gemini, /api/schema, etc.)
               ▼
┌─────────────────────────────────────────────┐
│        Next.js API Layer (Proxy)            │
│  Clerk session validation                   │
│  Credit/usage gating                        │
│  User metadata stored in Clerk              │
└──────────────┬──────────────────────────────┘
               │  Proxied to NEXT_PUBLIC_BACKEND_URL
               ▼
┌─────────────────────────────────────────────┐
│         Backend API Server                  │
│  Express.js + Node.js                       │
│  Google Gemini AI (schema generation)       │
│  MongoDB (schema / session storage)         │
└─────────────────────────────────────────────┘
```

**Key design decisions:**
- User authentication and credit tracking are handled entirely through **Clerk private metadata**, removing the need for a separate user database table.
- Next.js API routes act as a secure proxy and middleware layer, enforcing auth and credit checks before forwarding requests to the backend.
- The frontend is deployed on **Vercel**; the backend can be deployed independently (e.g., Railway, Render, or a VPS).

---

## Getting Started

### Prerequisites

- **Node.js 18.x or higher** – [Download](https://nodejs.org/)
- **npm 9.x or higher** (bundled with Node.js)
- A running **backend server** (see [Backend Setup](#backend-setup))
- A **Clerk account** – [clerk.com](https://clerk.com) (free tier available)
- A **Razorpay account** – [razorpay.com](https://razorpay.com) (required for payment features; test mode is sufficient for development)
- A **Google Gemini API key** – required by the backend for schema generation

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/Aayush-Sood101/LaymanDB.git
cd LaymanDB
```

#### 2. Install dependencies

```bash
npm install
```

This is a **single Next.js application**—there is no separate `frontend/` directory to navigate to.

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# ─── Clerk Authentication ──────────────────────────────────────────
# Get these from https://dashboard.clerk.com → Your App → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx

# Optional: Customize Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/generate
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/generate

# ─── Backend API ────────────────────────────────────────────────────
# URL of your backend Express server (no trailing slash)
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000

# ─── Razorpay Payments ──────────────────────────────────────────────
# Get these from https://dashboard.razorpay.com → Settings → API Keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

> **Never commit `.env.local` to version control.** It is already listed in `.gitignore`.

#### Backend environment variables

The backend server requires its own environment file. Create a `.env` file in your backend project directory:

```env
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/laymandb
GOOGLE_AI_API_KEY=your_google_ai_api_key
LOG_LEVEL=info
```

### Backend Setup

Before running the frontend, make sure the backend server is running.

#### Option A – Local backend

1. Clone and navigate to the backend repository.
2. Install dependencies: `npm install`
3. Configure the backend `.env` file as described above.
4. Start MongoDB locally:

   **macOS (Homebrew)**:
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   brew services start mongodb-community
   ```

   **Ubuntu/Debian**:
   ```bash
   sudo apt update && sudo apt install -y mongodb
   sudo systemctl start mongodb
   ```

   **Windows**: Download and install from the [MongoDB website](https://www.mongodb.com/try/download/community), then start `mongod`.

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The server will be available at `http://localhost:4000`.

#### Option B – Cloud/hosted backend

Set `NEXT_PUBLIC_BACKEND_URL` in `.env.local` to the public URL of your deployed backend (e.g., `https://your-backend.railway.app`).

### Running the Application

```bash
npm run dev
```

Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

Available scripts:

| Script | Description |
|---|---|
| `npm run dev` | Start the development server with Turbopack |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server (requires `npm run build` first) |
| `npm run lint` | Run ESLint across the project |

---

## Usage Guide

### Step-by-step workflow

#### 1. Sign up or sign in
Navigate to `/sign-up` to create a free account, or `/sign-in` to log in. Authentication is handled by **Clerk**—you can sign in with email/password or OAuth providers configured in your Clerk dashboard.

#### 2. Go to the Generate page
After signing in, navigate to `/generate`. New users receive **10 free schema generations**—no payment required.

#### 3. Describe your database
In the **Prompt Input Panel** on the left, type a natural language description of your database requirements. Be as specific or as high-level as you like. Example:

```
I need a database for an online bookstore. It should have customers who can place
orders, books that belong to categories, and authors. A book can have multiple authors,
and a customer can place multiple orders. Each order contains multiple books with
quantities. Track inventory and order status.
```

#### 4. Enhance and optimize (AI refinement)
Click **Enhance Prompt** to have Gemini improve and expand your description. Then click **Optimize Prompt** to fine-tune it further. You can accept, edit, or skip these suggestions. This two-step refinement loop produces more accurate schemas.

#### 5. Generate schema
Click **Generate Schema**. Gemini processes your refined prompt and returns a complete schema with entities, attributes, and relationships. This uses one credit from your free trial or paid pack.

#### 6. Explore the ERD
The **Schema Visualization** panel on the right renders an interactive Entity-Relationship Diagram. You can:
- Drag entities to rearrange the layout
- Zoom in/out and pan around the canvas
- Hover over nodes to inspect attributes and data types

#### 7. Export your design
Click the **Export** button to open the Export Dialog. Choose from:

| Export Format | Description |
|---|---|
| **PostgreSQL SQL** | CREATE TABLE statements for PostgreSQL |
| **MySQL SQL** | CREATE TABLE statements for MySQL |
| **SQLite SQL** | CREATE TABLE statements for SQLite |
| **SQL Server SQL** | CREATE TABLE statements for SQL Server |
| **Mermaid Diagram** | Mermaid `erDiagram` syntax for docs/wikis |
| **Documentation** | Full Markdown documentation of the schema |
| **PNG Image** | Visual snapshot of the ERD canvas |

All text-based exports include a **Copy to Clipboard** button.

#### 8. Use the Gemini Playground
Navigate to `/gemini-playground` for a conversational AI interface. Ask follow-up questions about your schema, explore alternative designs, or query the AI directly.

---

## Pricing & Credits

LaymanDB uses a **pay-as-you-go credit system**. There are no recurring subscriptions.

| Plan | Price | Credits | Notes |
|---|---|---|---|
| **Free Trial** | ₹0 | 10 generations | Automatically available to every new user |
| **Basic** | ₹50 (one-time) | 100 generations | Standard SQL export and visualization |
| **Premium** | ₹80 (one-time) | 200 generations | Advanced SQL export, priority email support |

- Credits are stored securely in your **Clerk user profile** (private metadata).
- Payments are processed by **Razorpay** and verified server-side before credits are applied.
- You can check your remaining credits at any time on the `/pricing` page.

---

## Authentication

Authentication is powered by **[Clerk](https://clerk.com)**:

- **Sign up**: `/sign-up`
- **Sign in**: `/sign-in`
- **Protected routes**: The `/generate` and `/billing/*` routes require an active session. Unauthenticated users are redirected to `/sign-in` by the `RouteProtection` component and Clerk middleware.
- **User metadata**: Free trial usage count and paid credit balance are stored in Clerk's private user metadata—never exposed to the client directly.

---

## API Routes

All Next.js API routes live under `src/app/api/`. Requests to `/api/*` from the frontend are either handled locally (auth/payment) or proxied to the backend server.

### Locally handled routes

| Route | Method | Description |
|---|---|---|
| `/api/schema-generation` | `POST` | Validates auth, checks/deducts credits, forwards to backend |
| `/api/user/status` | `GET` | Returns current user's credit balance and subscription tier |
| `/api/payment` | `POST` | Creates a Razorpay order for the selected credit plan |
| `/api/payment/verify` | `POST` | Verifies Razorpay payment signature and applies credits |

### Proxied to backend

| Route | Method | Description |
|---|---|---|
| `/api/gemini/generate` | `POST` | Generate an ER schema from a natural language prompt |
| `/api/gemini/prompt` | `POST` | Gemini Playground conversational query |
| `/api/schema/*` | `GET/POST/PUT/DELETE` | Schema CRUD operations |
| `/api/query/generate` | `POST` | Generate SQL queries from natural language |
| `/api/mermaid-query` | `POST` | Generate/process Mermaid diagram queries |

---

## Component Reference

### Page Components (`src/app/`)

| Page | Route | Description |
|---|---|---|
| `home/page.js` | `/` | Landing page with hero, features, and pricing overview |
| `generate/page.js` | `/generate` | Main workspace: prompt input + ERD visualization |
| `pricing/page.js` | `/pricing` | Pricing plans, current credit balance, Razorpay checkout |
| `features/page.js` | `/features` | Detailed feature showcase with parallax visuals |
| `gemini-playground/page.js` | `/gemini-playground` | Conversational AI interface |
| `contact-us/page.js` | `/contact-us` | Contact form (EmailJS) |
| `billing/page.js` | `/billing/success`, `/billing/cancel` | Post-payment confirmation pages |
| `sign-in/page.js` | `/sign-in` | Clerk sign-in page |
| `sign-up/page.js` | `/sign-up` | Clerk sign-up page |
| `subscribe/page.js` | `/subscribe` | Subscription management |

### UI Components (`src/components/`)

| Component | Description |
|---|---|
| `PromptInputPanel.js` | Natural language input, prompt enhancement/optimization controls, and schema generation trigger |
| `SchemaVisualization.js` | Container for the ReactFlow ERD canvas |
| `ExportDialog.js` | Multi-tab export modal (SQL, Mermaid, Documentation, PNG) |
| `SessionHistory.js` | Sidebar panel listing previously generated schemas in the session |
| `MermaidDiagram.js` | Client-side Mermaid diagram renderer |
| `MermaidQueryPlayground.js` | Interactive Mermaid diagram editor |
| `QueryPlayground.js` | SQL query generation playground |
| `Navbar.js` | Top navigation bar with auth-aware links |
| `Footer.js` / `StackedCircularFooter.js` | Site footer |
| `PaywallNotice.js` | Shown when a user runs out of credits |
| `RouteProtection.js` | Wraps protected pages; redirects unauthenticated users |
| `WorkspaceLayout.js` | Resizable two-panel layout for the Generate page |
| `PageTemplate.js` | Consistent page wrapper with navigation and footer |
| `SubscriptionStatus.js` | Compact credit/plan status indicator |

### Diagram Components (`src/components/diagram/`)

Custom ReactFlow node and edge components that render the ERD canvas.

### Context (`src/contexts/`)

| Context | Description |
|---|---|
| `SchemaContext.js` | Global state for the current schema, ERD nodes/edges, export data, and dialog visibility |
| `SubscriptionLoaderContext.js` | Subscription data loading state (legacy; most pages now fetch directly — new code should not use this context) |

---

## Sample Inputs

The file [`sample-inputs.md`](./sample-inputs.md) contains **20 ready-to-use database descriptions** covering a wide range of domains:

1. E-commerce platform
2. Blog / CMS
3. Hospital management
4. University management
5. Inventory / warehouse
6. Real estate agency
7. Library management
8. Project management
9. Social network
10. Event management
11. Financial management
12. Hotel reservation
13. Human resources
14. Supply chain
15. Fitness center
16. Music streaming service
17. Insurance management
18. Restaurant operations
19. Airline reservation
20. Healthcare information system

Use these as starting points to explore LaymanDB's capabilities.

---

## Common Issues & Solutions

### Authentication errors

| Issue | Solution |
|---|---|
| "Authentication required" on `/generate` | Ensure you are signed in. Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set correctly. |
| Redirect loop on sign-in | Verify `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` in `.env.local`. |

### Backend connection errors

| Issue | Solution |
|---|---|
| "Failed to generate schema" / 502 errors | Confirm the backend server is running. Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`. |
| CORS errors in the browser console | Set `FRONTEND_URL=http://localhost:3000` in the backend `.env` file. |

### Payment errors

| Issue | Solution |
|---|---|
| "Payment system could not be initialized" | Ensure `NEXT_PUBLIC_RAZORPAY_KEY_ID` is set in `.env.local`. |
| "Payment verification failed" | Check that `RAZORPAY_KEY_SECRET` is correct and matches the key ID. |

### General issues

| Issue | Solution |
|---|---|
| Port already in use (3000) | Run `npx kill-port 3000` or change the port with `PORT=3001 npm run dev`. |
| Missing dependencies | Run `npm install` from the project root. |
| ReactFlow rendering issues | Clear your browser cache. Ensure `import 'reactflow/dist/style.css'` is present in `layout.js`. |
| Stale subscription data | Add a cache-busting parameter: the app already does this automatically via `?t=<timestamp>`. |

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
