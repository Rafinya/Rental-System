# Weena Loft — Rental Management System

A React + TypeScript + Vite rental management dashboard for Weena Loft Accommodations.

## Features

- Building and floor overview
- Unit and tenant management
- Repairs and maintenance tracking
- Reports and property analytics
- Role-based access control
- Owner-only user management (add, edit, delete accounts and roles)
- Profile and password security settings
- Local-first data persistence via `localStorage`
- JSON backup export and restore

## Roles

| Role | Access |
| --- | --- |
| **Owner / System Admin** | All pages, user management, and profile switching |
| **Manager** | Day-to-day operations, reports, and settings |
| **Maintenance Staff** | Repairs & Maintenance only, plus personal profile/password settings |

## Run Locally

**Prerequisites:** Node.js

```bash
npm install --legacy-peer-deps
npm run dev
```

The app runs on [http://localhost:5174](http://localhost:5174).

## Build

```bash
npm run build
npm run preview
```

## Validation

```bash
npm run lint
```

## Data Storage

All data is stored locally in the browser using `localStorage`. Use **Settings → Data Management** to export a JSON backup or restore from a previous backup.
