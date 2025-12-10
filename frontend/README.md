# 🩹 SimAid — Interactive First Aid Training Platform

SimAid is a full-stack web application that gamifies **first aid learning** through scenario-based simulations.  
Users progress through levels, earn badges, and unlock certificates for mastering key emergency response skills.

---

## 🚀 Tech Stack

### 🖥️ Frontend
- **React 18** with functional components and hooks  
- **Custom Hooks Architecture** for modular logic (`useAuth`, `useLevels`, `useUserLevels`, etc.)  
- **React Router** for page navigation  
- **CSS Modules / Custom Styles** (`/styles/`)  
- **Responsive design**, accessible and mobile-friendly  

### ⚙️ Backend
- **Node.js + Express.js**  
- **MySQL 8+** database with `mysql2/promise` connection pool  
- **Domain-driven structure** with:
  - Entities  
  - Repositories  
  - Services  
  - Controllers  
- **JWT Authentication** (`access token`)  
- **Bcrypt password hashing**  
- **Role-based Access Control (RBAC)** via `isAdmin` middleware  
- **Validation Layer** using `express-validator`  
- **Centralized Error Handling**

---

## 🧩 Key Features

| Category | Description |
|-----------|-------------|
| 🎮 **Scenarios & Steps** | Interactive multi-step training scenarios with MCQ-style questions and feedback |
| 🧠 **Levels** | Structured progression system with increasing difficulty |
| 🏅 **Badges** | Earn badges when you complete levels with perfect scores |
| 🧾 **Certificates** | Generate printable/shareable PDF certificate on completion |
| 👤 **User System** | Registration, login, JWT sessions, role-based access |
| 💾 **Progress Tracking** | Saves attempts, tracks scores, and unlocks next levels automatically |

---

## 🗂️ Project Structure

# 🩹 SimAid — Interactive First Aid Training Platform

SimAid is a full-stack web application that gamifies **first aid learning** through scenario-based simulations.  
Users progress through levels, earn badges, and unlock certificates for mastering key emergency response skills.

---

## 🚀 Tech Stack

### 🖥️ Frontend
- **React 18** with functional components and hooks  
- **Custom Hooks Architecture** for modular logic (`useAuth`, `useLevels`, `useUserLevels`, etc.)  
- **React Router** for page navigation  
- **CSS Modules / Custom Styles** (`/styles/`)  
- **Responsive design**, accessible and mobile-friendly  

### ⚙️ Backend
- **Node.js + Express.js**  
- **MySQL 8+** database with `mysql2/promise` connection pool  
- **Domain-driven structure** with:
  - Entities  
  - Repositories  
  - Services  
  - Controllers  
- **JWT Authentication** (`access token`)  
- **Bcrypt password hashing**  
- **Role-based Access Control (RBAC)** via `isAdmin` middleware  
- **Validation Layer** using `express-validator`  
- **Centralized Error Handling**

---

## 🧩 Key Features

| Category | Description |
|-----------|-------------|
| 🎮 **Scenarios & Steps** | Interactive multi-step training scenarios with MCQ-style questions and feedback |
| 🧠 **Levels** | Structured progression system with increasing difficulty |
| 🏅 **Badges** | Earn badges when you complete levels with perfect scores |
| 🧾 **Certificates** | Generate printable/shareable PDF certificate on completion |
| 👤 **User System** | Registration, login, JWT sessions, role-based access |
| 💾 **Progress Tracking** | Saves attempts, tracks scores, and unlocks next levels automatically |

---

## 🗂️ Project Structure

simaid/
├── backend/
│ ├── src/
│ │ ├── config/ # Database connection + health check
│ │ ├── controllers/ # Route controllers (Express)
│ │ ├── domain/
│ │ │ ├── entities/ # Data models
│ │ │ ├── repositories/# Database queries
│ │ │ └── dto/ # DTOs for clean data transfer
│ │ ├── middlewares/ # Auth / Error handling
│ │ ├── routes/ # RESTful routes
│ │ ├── services/ # Business logic
│ │ ├── utils/ # Helpers (JWT, bcrypt, feedback, etc.)
│ │ ├── app.js # Express app setup
│ │ └── server.js # Entry point
│ └── package.json
│
├── frontend/
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── hooks/ # Custom React hooks
│ │ ├── pages/ # Page-level components (Home, Level, Profile)
│ │ ├── services/ # API services
│ │ ├── styles/ # CSS styles
│ │ └── app.jsx
│ └── package.json
│
├── .env.example # Environment variable template
├── README.md
└── package.json # Root project config (optional)


---

## ⚙️ Environment Variables

Create a `.env` file inside the **backend** directory:

```bash
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=simaid
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=7d

## Setup & Installation:

git clone https://github.com/yourusername/simaid.git
cd simaid

## Install dependencies:

# Backend
cd backend
npm install

#Frontend
cd ../frontend
npm install

## Set up database

CREATE DATABASE simaid;

Then import your schema file:

## Run the app:

## Backend:

cd backend
npm run dev

It will start at http://localhost:4000

## Frontend:

cd ../frontend
npm run dev

Accessible at http://localhost:5173


# API Endpoints:

| Method | Endpoint                        | Description               |
| ------ | ------------------------------- | ------------------------- |
| `POST` | `/api/users/register`           | Register new user         |
| `POST` | `/api/users/login`              | Login user                |
| `GET`  | `/api/levels`                   | Fetch all levels          |
| `GET`  | `/api/scenarios/level/:levelId` | Get scenarios by level    |
| `POST` | `/api/attempts`                 | Save or update best score |
| `GET`  | `/api/user-levels`              | Get user level progress   |
| `POST` | `/api/user-badges`              | Assign badge to user      |

## Development Notes

Each repository handles a single SQL responsibility.
Service layer encapsulates business logic.
Controllers manage route I/O and responses.
React hooks keep frontend logic modular and reusable.
Fully written in ESM syntax (import/export).

## Future Enhancements:

🧩 Add leaderboard for top performers
🔔 Real-time notifications (WebSocket)
🌍 Multi-language support
📱 PWA mode for offline training

## Credits

Author: Reine Rahim
Email: reinerahim2910@gmail.com
Organization: plus
Framework: Node.js + React + MySQL