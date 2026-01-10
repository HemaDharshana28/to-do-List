# TaskFlow — Full-Stack Task Management Application

A production-ready task management app built with **React.js**, **Node.js**, **Express.js**, **MySQL**, **JWT Auth**, and **Tailwind CSS**.

---

## Tech Stack

| Layer     | Technology                                  |
|-----------|---------------------------------------------|
| Frontend  | React 18, React Router 6, Tailwind CSS 3    |
| Backend   | Node.js, Express.js                         |
| Database  | MySQL 8+                                    |
| Auth      | JWT (JSON Web Tokens) + bcryptjs            |
| Build     | Vite 5                                      |

---

## Project Structure

```
taskflow/
├── backend/
│   ├── config/
│   │   ├── database.js        # MySQL connection pool
│   │   └── init.sql           # Database schema
│   ├── controllers/
│   │   ├── authController.js  # Register, login, profile
│   │   └── taskController.js  # CRUD + bulk operations
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   └── errorHandler.js    # Global error handling
│   ├── models/
│   │   ├── User.js            # User data model
│   │   └── Task.js            # Task data model
│   ├── routes/
│   │   ├── auth.js            # /api/auth/*
│   │   └── tasks.js           # /api/tasks/*
│   ├── .env.example
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/AppLayout.jsx   # Sidebar navigation
        │   └── tasks/
        │       ├── TaskCard.jsx       # Task display card
        │       └── TaskModal.jsx      # Create/edit modal
        ├── context/AuthContext.jsx    # Global auth state
        ├── hooks/useTasks.js          # Task data hook
        ├── pages/
        │   ├── DashboardPage.jsx      # Stats overview
        │   ├── TasksPage.jsx          # Full task management
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   └── ProfilePage.jsx
        └── utils/api.js               # Axios + interceptors
```

---

## Quick Start

### Prerequisites

- Node.js v18+
- MySQL 8+

### 1. Database Setup

```sql
-- In MySQL client:
source backend/config/init.sql;
```

Or manually:
```bash
mysql -u root -p < backend/config/init.sql
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
npm run dev
```

The API runs at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`

---

## API Reference

### Authentication

| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| POST   | /api/auth/register    | Create account       | No   |
| POST   | /api/auth/login       | Login & get token    | No   |
| GET    | /api/auth/me          | Get current user     | Yes  |
| PUT    | /api/auth/profile     | Update profile       | Yes  |
| PUT    | /api/auth/password    | Change password      | Yes  |

### Tasks

| Method | Endpoint              | Description          | Auth |
|--------|-----------------------|----------------------|------|
| GET    | /api/tasks            | List tasks (filtered)| Yes  |
| POST   | /api/tasks            | Create task          | Yes  |
| GET    | /api/tasks/:id        | Get single task      | Yes  |
| PUT    | /api/tasks/:id        | Update task          | Yes  |
| DELETE | /api/tasks/:id        | Delete task          | Yes  |
| GET    | /api/tasks/stats      | Get task statistics  | Yes  |
| POST   | /api/tasks/bulk       | Bulk status/delete   | Yes  |

### Query Parameters (GET /api/tasks)

| Param      | Values                          |
|------------|---------------------------------|
| status     | todo, in_progress, done         |
| priority   | low, medium, high               |
| search     | string (searches title & desc)  |
| sort       | created, due, priority, title   |
| dir        | asc, desc                       |
| limit      | number                          |
| offset     | number                          |

---

## Features

- **JWT Authentication** — Secure login/register with token-based auth
- **Full CRUD** — Create, read, update, delete tasks
- **Smart Filtering** — Filter by status, priority, search term, sort order
- **Bulk Operations** — Select multiple tasks, bulk delete or status update
- **Task Status Cycling** — Click status icon to cycle: Todo → In Progress → Done
- **Due Dates** — Set deadlines with overdue detection
- **Tags** — Add multiple tags to tasks
- **Stats Dashboard** — Real-time overview of task progress
- **Profile Management** — Update name, avatar color, and password
- **Responsive Design** — Full mobile support with slide-out sidebar

---

## Database Schema

```sql
users (id, name, email, password, avatar_color, created_at, updated_at)
tasks (id, user_id, title, description, status, priority, due_date, tags JSON, created_at, updated_at)
task_activity (id, task_id, user_id, action, details JSON, created_at)
```

---

## Environment Variables

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=taskflow_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## Security Highlights

- Passwords hashed with **bcryptjs** (salt rounds: 12)
- JWT tokens expire after 7 days
- SQL injection prevented via **parameterized queries**
- Input validation with **express-validator**
- CORS configured per environment
- All task routes scoped to authenticated user (no data leakage)
