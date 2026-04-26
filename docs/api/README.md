# API Docs

## Base URL
- Development: `http://localhost:5000/api`

## Auth
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Access Control
- `GET /roles`
- `POST /roles/with-permissions`
- `GET /roles/:id/permissions`
- `PUT /roles/:id/permissions`
- `GET /roles/users`
- `PUT /roles/users/:userId/role`

## Core CRUD
- `users`, `permissions`, `departments`, `capa`, `ncr`, `audits`

## Documents and Settings
- `documents`, `smtp-settings`, `storage-settings`, `company-profiles`
