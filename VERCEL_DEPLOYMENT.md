# Deployment to Vercel

This project is configured to be deployed as a single Vercel project containing both the Frontend (Vite) and Backend (Express/Serverless).

## Prerequisites

1.  **Vercel Account**: [Sign up](https://vercel.com/signup).
2.  **Hosted PostgreSQL Database**: You need a cloud database. Options include:
    *   [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Recommended for ease of use)
    *   [Neon](https://neon.tech)
    *   [Supabase](https://supabase.com)
    *   [Render PostgreSQL](https://render.com)
3.  **Git Repository**: Push this code to GitHub, GitLab, or Bitbucket.

## Deployment Steps

1.  **Import Project**:
    *   Go to your Vercel Dashboard.
    *   Click **"Add New..."** -> **"Project"**.
    *   Import your repository.

2.  **Configuration**:
    *   **Root Directory**: Leave as `./` (default).
    *   **Framework Preset**: Vercel might detect Vite or Other. Since we use `vercel.json` with specific builds, it should handle it. If asked, you can select "Other" or "Vite", but `vercel.json` takes precedence for the build configuration.

3.  **Environment Variables**:
    *   Expand the **"Environment Variables"** section.
    *   Add the following variables:
        *   `DATABASE_URL`: Your full PostgreSQL connection string (e.g., `postgres://user:pass@host:5432/db?sslmode=require`).
        *   `JWT_SECRET`: A secure random string for signing tokens (e.g., generate one with `openssl rand -base64 32`).
        *   `NODE_ENV`: Set to `production` (usually default).
        *   `VITE_API_URL`: (Optional) You can leave this empty. The app is configured to use `/api` relative path in production, which works perfectly with the Vercel Rewrites.

4.  **Deploy**:
    *   Click **"Deploy"**.

## Post-Deployment

1.  **Database Migration**:
    *   The deployment will generate the Prisma Client, but it will **NOT** run migrations automatically (to avoid accidental data loss).
    *   You must apply the schema to your production database.
    *   **Option A (Local)**: Run this command locally, pointing to your production DB:
        ```bash
        DATABASE_URL="your_production_connection_string" npx prisma migrate deploy --schema=server/prisma/schema.prisma
        ```
    *   **Option B (Vercel Console)**: Not recommended, but possible via enabling "Redeploy" hooks if you add a migration script. Stick to Option A.

2.  **Verify**:
    *   Open your deployment URL.
    *   Try logging in (ensure you have seeded users or create one via DB).
    *   The `/api/health` endpoint should return `{"status":"ok",...}`.

## Project Structure for Vercel

*   `vercel.json`: Configures the project to build the frontend (static) and backend (serverless).
*   `api/index.ts`: The entry point for Vercel Serverless Functions.
*   `package.json` (Root): Defines the workspace to install dependencies for both client and server.

## Demo Mode

To populate the database with realistic mock data for verification or demo purposes:

1.  After deployment, make a POST request to the seed endpoint:
    ```bash
    curl -X POST https://your-project.vercel.app/api/seed/demo
    ```
2.  This will:
    *   Clear existing data.
    *   Create users (Admin, Engineer, Operator, etc.).
    *   Create machines and defect types.
    *   Generate ~50 historical defect logs.
3.  Log in with: `admin@factory.com` / `password`.
