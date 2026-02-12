# P1-T05: Authentication (NextAuth + Express JWT)

> **Phase:** 1 — Core MVP
> **Status:** ⬜ Not Started
> **Dependencies:** P1-T02, P1-T03, P1-T04
> **Estimated Time:** 4 hours

## Objective

Implement full authentication flow using NextAuth.js v5 on the frontend and JWT verification on the Express backend. Support email/password registration, login, session management, and role-based access control.

## Scope

### 1. NextAuth.js v5 Setup (Frontend)

- Install `next-auth@beta` (Auth.js v5)
- Configure credential provider (email + password)
- JWT strategy with HTTP-only cookies
- Session callback to include user role
- `auth.ts` configuration file

### 2. Auth API Routes (Backend)

Implement in `apps/api/src/routes/auth.ts`:

- `POST /api/auth/register` — create user with bcrypt password hash
- `POST /api/auth/login` — verify credentials, return JWT
- `POST /api/auth/logout` — invalidate session
- `GET /api/auth/session` — return current user info
- `POST /api/auth/forgot-password` — send reset email (stub initially)
- `POST /api/auth/reset-password` — reset password with token

### 3. Auth Middleware (Backend)

Complete the auth middleware stub from P1-T03:

- JWT verification from cookie or Authorization header
- Attach user object to `req.user`
- Role-checking middleware factory: `requireRole('ADMIN')`, `requireRole('INDIVIDUAL_SELLER', 'DEALERSHIP')`

### 4. Zod Validation Schemas

- `registerSchema` — email, password (min 8, uppercase, number), name
- `loginSchema` — email, password
- `resetPasswordSchema` — token, newPassword

### 5. Frontend Auth Components

Create in `apps/web/components/auth/`:

- `login-form.tsx` — email + password with React Hook Form
- `register-form.tsx` — name, email, password, confirm password
- `auth-provider.tsx` — SessionProvider wrapper

### 6. Auth Pages

- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(auth)/forgot-password/page.tsx`

### 7. Protected Route Utilities

- `lib/auth.ts` — `getServerSession()` helper
- Middleware for protected routes
- Redirect unauthenticated users from dashboard routes

## Acceptance Criteria

- [ ] Users can register with email and password
- [ ] Users can log in and maintain sessions
- [ ] JWT is stored in HTTP-only cookie
- [ ] Backend endpoints validate JWT correctly
- [ ] Role-based access control works (BUYER cannot access admin routes)
- [ ] Password is hashed with bcrypt
- [ ] Form validation shows proper error messages
- [ ] Session persists across page refreshes

## Security Considerations

- bcrypt with salt rounds of 12
- JWT expiry: 24 hours (refresh strategy optional for MVP)
- Rate limit auth endpoints: 10 req/min per IP
- Password requirements: min 8 chars, 1 uppercase, 1 number
- CSRF protection via SameSite cookie attribute
