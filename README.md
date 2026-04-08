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

## Quick Start

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

Access the app at `http://localhost:3002`.
