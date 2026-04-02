# Render.com Deployment Guide - Shootix License Server

This guide explains how to deploy the unified License Server and Admin Dashboard to Render.com with persistent SQLite storage.

## 1. Create a Web Service
- **Runtime**: Node
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

## 2. Persistent Disk (CRITICAL)
Render's free tier has an ephemeral file system. To keep your licenses and trials:
- Go to the **Disk** tab in your Render service.
- Click **Add Disk**.
- **Name**: `shootix-data`
- **Mount Path**: `/opt/render/project/src/backend/data`
- **Size**: 1 GB is plenty.

> [!IMPORTANT]
> Change the `DB_PATH` in your Environment Variables to `/opt/render/project/src/backend/data/licenses.db` to match the mount path.

## 3. Environment Variables
Add these in the **Env** tab:
- `PORT`: `3334` (or whatever Render assigns)
- `JWT_SECRET`: A long random string.
- `ADMIN_PASSWORD`: Your dashboard password.
- `ADMIN_SESSION_TOKEN`: A secret token for sessions.
- `DB_PATH`: `/opt/render/project/src/backend/data/licenses.db`
- `TRIAL_DAYS`: `5`

## 4. Health Check
- Render can use the `/` path for health checks.
- It should return `{"status": "ok", ...}`.
