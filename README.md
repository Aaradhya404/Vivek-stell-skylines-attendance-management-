# Vivek Steel Skylines — Employee Attendance Management System

This is the full-stack Attendance Management Web Application for **Vivek Steels Skyline Private Limited**. The system is built for a single admin (**Dharmendra Singh Sisodiya**) to manage, track, and export employee attendance.

---

## 🚀 Tech Stack

### Frontend
- **React 18 + Vite** — UI framework and build tooling.
- **Redux Toolkit** — Client global state management.
- **Tailwind CSS** — Layout styling and customized blue theme.
- **Framer Motion** — Smooth animations (page shifts, badges, modals).
- **Lucide React** — Uniform high-quality modern icon pack.
- **Recharts** — Analytics visual charts (bar/line trends).
- **jsPDF + xlsx** — Native browser file exports.

### Backend
- **Node.js + Express.js** — Server execution engine.
- **SQLite + Prisma ORM** — Local database store (zero-config, high performance).
- **JWT + Bcrypt.js** — Secure credential validation and sessions.
- **Helmet + Rate Limiting** — API defense layers against brute-forcing and request floods.
- **Node-Cron** — Nightly database auto-mark backfiller.
- **Winston** — Internal event logger outputs to `logs/` directory.

---

## 🛠️ Getting Started

### 1. Database & Backend Setup (`server/`)
1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. The system database is **SQLite** by default (defined in `.env`), which runs locally without requiring Postgres server installs.
3. Push schema models and instantiate client:
   ```bash
   npx prisma db push
   ```
4. Seed the registry database with admin credentials and the 48 employee list:
   ```bash
   node prisma/seed.js
   ```
5. Launch the Node development API server:
   ```bash
   npm run dev
   ```
   *The backend server will launch on port `5000`.*

### 2. Frontend client Setup (`client/`)
1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Launch the Vite hot-reloading development server:
   ```bash
   npm run dev
   ```
   *The React interface will open at `http://localhost:5173`.*

---

## 🔐 Credentials (Seeded)

- **Admin Username:** `dharmendra` (or email: `dharmendra@viveksteel.com`)
- **Admin Password:** `Admin@1234`
*(Changeable inside the Settings Page)*

---

## 📂 Key Features

1. **Dashboard Home:** Metrics cards, single-click Today's Quick Mark panel, bulk Present marks, and live logging monitor.
2. **Daily Attendance Sheet:** Date selector, designation filters, check-in/out conditional timepickers, leave category designations, and yellow-highlighted unsaved row markers.
3. **History logs:** Pagination lists for any month/year, designation filters, notes preview, and browser-native PDF/Excel exports.
4. **Registry Management:** Modify employee credentials, soft-delete entries (toggle active), or add new staff.
5. **Reports:** Visual trends mapping daily present counts and employee leave summary charts.
6. **Holiday Calendar:** Add holidays to auto-backfill leaves for all active employees.
