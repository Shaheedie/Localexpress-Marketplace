# Installation Guide

This guide explains how to install and run the LocalExpress Marketplace project on your computer.

## Requirements

Install these first:

1. Node.js 20 or newer
2. npm, which comes with Node.js
3. A code editor such as Visual Studio Code
4. A modern browser such as Chrome, Edge, or Firefox

## Step 1: Extract the ZIP File

Extract the project folder to a simple location, for example:

```text
Desktop/localexpress-marketplace
```

## Step 2: Install Root Dependency

Open a terminal in the main project folder and run:

```bash
npm install
```

## Step 3: Install Frontend and Backend Dependencies

Run:

```bash
npm run install:all
```

This installs the backend and frontend packages.

## Step 4: Configure Environment Files

Backend:

```bash
cd backend
copy .env.example .env
```

For Mac/Linux:

```bash
cp .env.example .env
```

Frontend:

```bash
cd frontend
copy .env.example .env
```

For Mac/Linux:

```bash
cp .env.example .env
```

The frontend defaults are ready for local development. Replace the backend `JWT_SECRET` value with a private random secret before starting the API.

## Step 5: Start the Project

Go back to the main project folder and run:

```bash
npm run dev
```

The frontend will open at:

```text
http://localhost:5173
```

The backend will run at:

```text
http://localhost:5000
```

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@localexpress.com | admin123 |
| Seller | seller@localexpress.com | seller123 |
| Buyer | buyer@localexpress.com | buyer123 |

## Common Problems

### Port already in use

If port 5000 or 5173 is already in use, close the other application using that port or change the port in the config.

### Cannot connect to backend

Make sure the backend is running on port 5000 and the frontend `.env` file contains:

```text
VITE_API_URL=http://localhost:5000/api
```

### Database not found

The database is created automatically when the backend starts. You do not need to create it manually.
