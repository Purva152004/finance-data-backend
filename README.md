# Finance Data Processing and Access Control Backend

Professional MERN-style backend (Node.js + Express + MongoDB) with role-based access control, financial record management, summary analytics APIs, and a browser dashboard for assessment demo.

## Live Scope Covered

### Core requirements (assessment)
- User and role management (`viewer`, `analyst`, `admin`)
- Financial records CRUD + filtering
- Dashboard summary APIs (income, expense, net, category totals, trends, recent activity)
- Backend access control (middleware based RBAC)
- Input validation and error handling
- MongoDB persistence

### Optional enhancements included
- JWT authentication
- Pagination
- Search/filter support
- Soft delete + restore
- Rate limiting
- Browser demo UI at `/`

## Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT
- HTML/CSS/JS dashboard (served from Express)

## Project Structure

```text
finance-data-backend/
  .env.example
  .gitignore
  package.json
  README.md
  public/
    index.html
    styles.css
    app.js
  src/
    app.js
    server.js
    config/
      db.js
    constants/
      roles.js
    controllers/
      auth.controller.js
      user.controller.js
      record.controller.js
      dashboard.controller.js
    middlewares/
      auth.middleware.js
      authorize.middleware.js
      validate.middleware.js
      notFound.middleware.js
      error.middleware.js
    models/
      user.model.js
      record.model.js
    routes/
      index.js
      auth.routes.js
      user.routes.js
      record.routes.js
      dashboard.routes.js
    scripts/
      seed.js
    utils/
      ApiError.js
      asyncHandler.js
      jwt.js
    validations/
      auth.validation.js
      user.validation.js
      record.validation.js
      dashboard.validation.js
```

## Local Setup

1. Go to project:
```bash
cd finance-data-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create env file:
```bash
cp .env.example .env
```

On PowerShell:
```powershell
Copy-Item .env.example .env
```

4. Update `.env` values:
- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV=development`

5. Run:
```bash
npm run dev
```

6. Open:
- Dashboard UI: `http://localhost:5000`

## Authentication Flow

### Create first admin (one-time only)
`POST /api/auth/bootstrap-admin`

Body:
```json
{
  "fullName": "Super Admin",
  "email": "admin@test.com",
  "password": "Admin@123"
}
```

### Register viewer
`POST /api/auth/register`

### Login
`POST /api/auth/login`

Use `Authorization: Bearer <token>` for protected routes.

## API Endpoints

### Auth
- `POST /api/auth/bootstrap-admin`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users (`admin` only)
- `POST /api/users`
- `GET /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### Records
- `POST /api/records` (`admin`)
- `GET /api/records` (`analyst`, `admin`)
- `GET /api/records/:id` (`analyst`, `admin`)
- `PATCH /api/records/:id` (`admin`)
- `DELETE /api/records/:id` (`admin`, soft delete)
- `PATCH /api/records/:id/restore` (`admin`)

### Dashboard
- `GET /api/dashboard/overview`
- `GET /api/dashboard/trends`
- `GET /api/dashboard/recent-activity`

## Render Deployment (Step by Step)

### A) Before deploying
1. Push project to GitHub (steps below).
2. Ensure MongoDB Atlas is ready:
   - Database user created
   - IP access allows Render (`0.0.0.0/0` for testing)

### B) Create service on Render
1. Open [Render Dashboard](https://dashboard.render.com/)
2. Click `New +` -> `Web Service`
3. Connect your GitHub repo
4. Select your backend repo

### C) Build settings
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Auto-Deploy: `Yes`

### D) Environment variables in Render
Add these in Render -> `Environment`:

- `MONGO_URI` = your Atlas URI
- `JWT_SECRET` = long random string
- `JWT_EXPIRES_IN` = `1d`
- `BCRYPT_SALT_ROUNDS` = `10`
- `NODE_ENV` = `production`

Do not set `PORT` manually on Render. Render provides it automatically.

### E) Deploy and verify
1. Click `Create Web Service`
2. Wait until deploy finishes
3. Open:
   - `https://your-service-name.onrender.com/`

## Troubleshooting

- `bad auth : authentication failed`
  - Atlas username/password is wrong or password has special characters not URL-encoded.

- `Unable to connect to the remote server` locally
  - Backend is not running. Start with `npm run dev`.

- Render deploy succeeds but API fails
  - Check Render env vars and service logs.
  - Verify Atlas network access includes Render IP range (`0.0.0.0/0` during testing).
