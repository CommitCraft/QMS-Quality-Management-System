# QMS

Enterprise Quality Management System with a React + TypeScript frontend, Express + TypeScript backend, Sequelize ORM, and MySQL.

## Project Structure

- `backend/` - API server, auth, RBAC, CRUD modules, upload handling, reports
- `frontend/` - Vite React dashboard, admin panel, charts, forms, routing
- `schema.sql` - MySQL schema for the complete data model

## Local Setup

### 1. Database

1. Create a MySQL database named `qms`.
2. Run `schema.sql` in MySQL to create the tables.
3. Update `backend/.env.example` with your database credentials and copy it to `.env`.

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Login

Default admin credentials:

- Username: `admin`
- Password: `admin123`

## Notes

- The backend seeds roles, permissions, departments, a default admin, sample CAPA/NCR/audit/document records, and activity logging.
- JWT refresh tokens are stored as hashed values in the database and reused via httpOnly cookies.
- Document uploads are stored under `backend/uploads/`.
- Backend startup uses safe `sequelize.sync()` by default. Set `DB_SYNC_ALTER=true` only when you intentionally want Sequelize to run schema alter operations.
# QMS-Quality-Management-System
# QMS-Quality-Management-System
