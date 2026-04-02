# Render.com Deployment Guide - PostgreSQL Migration

This guide explains how to deploy the Admin Dashboard and License Server to Render using a shared PostgreSQL database.

## 1. Create a PostgreSQL Database on Render
- Go to **Dashboard** -> **New** -> **PostgreSQL**.
- **Name**: `shootix-db`
- **Region**: Same as your web services.
- Once created, copy the **External Database URL**.

## 2. Update Web Services
For both your **License Server** and **Admin Dashboard** services on Render:

- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`

### Environment Variables
Add these in the **Env** tab for both services:
- `DATABASE_URL`: (Paste your External Database URL from Step 1).
- `NODE_ENV`: `production`
- `JWT_SECRET`: A long random string.
- `ADMIN_PASSWORD`: Your dashboard password.
- `ADMIN_SESSION_TOKEN`: A secret token for sessions.
- `TRIAL_DAYS`: `5`

## 3. Deployment
- Push the latest code to your GitHub repositories.
- Render will automatically detect the changes and redeploy using PostgreSQL.
- The servers will automatically initialize the tables if they don't exist.
