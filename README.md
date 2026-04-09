# Task Management System

A production-ready task management system built with NestJS and Next.js.

## Default Credentials

### 1. Admin Account
- **Email**: `admin@task.com`
- **Password**: `admin123`
- **Role**: `ADMIN` (Full access to all tasks and audit logs)

### 2. Regular User Account
- **Email**: `user@task.com`
- **Password**: `user123`
- **Role**: `USER` (View assigned tasks and update status only)

---

## Configuration

- **Backend Port**: `3000`
- **Frontend Port**: `3002`
- **API URL**: `http://localhost:3000`

---

## Quick Start (Local Development)

1. **Backend**:
   ```bash
   cd backend
   npm install --legacy-peer-deps
   npx prisma migrate dev --name init
   npx prisma db seed
   npm run start:dev
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run dev
   ```

---

## 🐳 Running with Docker (Recommended)

The easiest way to run the entire stack (Frontend, Backend, and Database sync) is using Docker Compose.

1. **Prerequisites**: Ensure you have Docker and Docker Compose installed.
2. **Build and Start**:
   ```bash
   docker-compose up --build
   ```

### What's included in Docker:
- **Backend**: Runs on Port `3000`. Automatically runs migrations on startup.
- **Frontend**: Runs on Port `3002`. Pre-configured to communicate with the backend.
- **Database**: Connects to your configured Neon PostgreSQL database.

---

## Access the App

- **Frontend**: [http://localhost:3002](http://localhost:3002)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
