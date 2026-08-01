# CareCircle — Full-Stack Elderly Care Platform

CareCircle connects **families**, **volunteers**, and **elderly care homes** through a unified web platform with role-based dashboards.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js, Prisma ORM, MySQL |
| Auth | JWT (24h expiry), bcrypt (salt rounds: 10) |
| Validation | Zod |
| Frontend | React 18, Vite, Tailwind CSS |
| State | React Context + useReducer |
| HTTP | Axios |
| Routing | React Router v6 |

---

## 📁 Project Structure

```
carecircle/
├── backend/
│   ├── prisma/schema.prisma       # 18-table Prisma schema
│   ├── src/
│   │   ├── config/database.js     # Prisma client singleton
│   │   ├── controllers/           # Business logic per entity
│   │   ├── middleware/            # Auth, Role, Validate
│   │   ├── routes/                # Express route files
│   │   └── utils/seed.js          # Prisma seeder
│   ├── seed.sql                   # Raw SQL seed (alternative)
│   ├── server.js                  # Express entry point
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── context/AuthContext.jsx # JWT auth state
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── admin/             # Admin role pages
    │   │   ├── family/            # Family role pages
    │   │   └── volunteer/         # Volunteer role pages
    │   ├── services/api.js        # Axios instance
    │   └── components/            # Shared UI components
    └── index.html
```

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js ≥ 18
- MySQL 8.x running locally
- npm or yarn

### 2. Clone & Configure

```bash
# Navigate into the project
cd carecircle

# Copy and fill in environment variables
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=carecircle_db
JWT_SECRET=your_super_secret_key
PORT=5000
DATABASE_URL="mysql://root:yourpassword@localhost:3306/carecircle_db"
```

### 3. Create the MySQL Database

```sql
CREATE DATABASE carecircle_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

### 5. Run Prisma Migration

```bash
npx prisma migrate dev --name init
```

> Or push schema directly (no migration history):
> ```bash
> npx prisma db push
> ```

### 6. Seed the Database

**Option A — Prisma seed (recommended):**
```bash
npm run seed
```

**Option B — Raw SQL seed:**
```bash
mysql -u root -p carecircle_db < seed.sql
```

### 7. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 8. Start the Application

**Backend** (in `backend/` directory):
```bash
npm run dev
# Runs on http://localhost:5000
```

**Frontend** (in `frontend/` directory):
```bash
npm run dev
# Runs on http://localhost:5173
```

---

## 🔐 Demo Credentials

All accounts use password: **`Password@123`**

| Role | Email |
|---|---|
| Admin | admin@carecircle.com |
| Family | priya.mehta@email.com |
| Family | rahul.gupta@email.com |
| Family | sneha.patel@email.com |
| Volunteer | vikram.singh@email.com |
| Volunteer | ananya.roy@email.com |
| Volunteer | deepak.kumar@email.com |
| Volunteer | kavita.nair@email.com |

---

## 🌐 API Overview

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Any |
| GET | `/api/users` | Admin |
| PUT | `/api/users/:id/status` | Admin |
| GET/POST | `/api/elderly` | Auth |
| GET/POST/DELETE | `/api/elderly/:id/notes` | Auth |
| GET/POST | `/api/tasks` | Auth |
| GET | `/api/tasks/pending` | Volunteer |
| POST | `/api/assignments` | Volunteer |
| PUT | `/api/assignments/:id/complete` | Volunteer |
| POST | `/api/verification` | Volunteer |
| GET | `/api/verification/pending` | Admin |
| PUT | `/api/verification/:id` | Admin |
| GET/POST | `/api/availability` | Volunteer |
| GET/POST | `/api/homes` | Admin/Auth |
| GET/POST | `/api/networks` | Admin/Auth |
| GET/POST | `/api/family-map` | Family |

---

## 🔑 Business Rules

- **Age is never stored** — computed via `TIMESTAMPDIFF(YEAR, date_of_birth, CURDATE())`
- **Task assignment guards**: task must be `Pending`, volunteer must be `Approved`, volunteer must have an availability slot on the task date
- **Family isolation**: Family users can only access elderly linked via `Family_Elderly_Map`
- **Admin unrestricted**: Full read/write on all resources

---

## 🗄️ Database — 18 Tables

`Roles` → `Users` → `User_Roles` → `Postal_Codes` → `Locations` → `Task_Categories` → `Elderly_Profiles` → `Elderly_Medical_Notes` → `Family_Elderly_Map` → `Emergency_Contacts` → `Elderly_Homes` → `Home_Networks` → `Home_Network_Map` → `Elderly_Home_Residents` → `Tasks` → `Task_Assignments` → `Volunteer_Verification` → `Availability_Slots`
