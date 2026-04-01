# Finance Data Processing and Access Control Backend

Professional MERN-style backend (Node.js + Express + MongoDB) with role-based access control, financial record management, summary analytics APIs, and a browser dashboard for assessment demo.

## Live Deployment

- App URL: `https://finance-data-backend.onrender.com/`

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
- Vanilla HTML/CSS/JS dashboard (served from Express)

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
Go to project:
```
cd finance-data-backend
```
Install dependencies:
```
npm install
```
Create env file:
```
cp .env.example .env
```
On PowerShell:
```
Copy-Item .env.example .env
```
Update .env values:
```
MONGO_URI
JWT_SECRET
NODE_ENV=development
```
Run:
```
npm run dev
```
Open:
```
Dashboard UI: http://localhost:5000
```
## Authentication Flow
### Create first admin (one-time only)
POST /api/auth/bootstrap-admin
```
Body:

{
  "fullName": "Super Admin",
  "email": "admin@test.com",
  "password": "Admin@123"
}
```
### Register viewer
POST /api/auth/register

### Login
POST /api/auth/login

