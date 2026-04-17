# Plan: Auth Migration to HTTP-only Cookies

## TL;DR

Migrate auth mechanism from localStorage + Bearer token to HTTP-only cookies for improved security (XSS protection). Token will be set by backend via `Set-Cookie` header and automatically sent with every request.

## Current State

- **Backend**: Login/register returns `{ token, user }` in response body
- **Frontend**: Token stored in localStorage, attached to `Authorization: Bearer <token>` header

## Target State

- **Backend**: Set token in cookie with `httpOnly`, `secure`, `sameSite` flags
- **Frontend**: No token management needed, just `withCredentials: true`

---

## Steps

### Phase 1: Backend Changes

1. **Install cookie-parser** — add middleware to parse cookies for Express
   - File: `packages/backend/package.json`

2. **Configure cookie-parser middleware** — register middleware in app setup
   - File: `packages/backend/src/app.ts`

3. **Update CORS config** — enable `credentials: true` for cross-origin cookie sending
   - File: `packages/backend/src/app.ts`

4. **Modify login response** — set token in cookie instead of response body
   - File: `packages/backend/src/modules/auth/auth.controller.ts`
   - Function: `login()` — use `res.cookie()` with httpOnly, secure, sameSite options

5. **Modify register response** — same as login
   - File: `packages/backend/src/modules/auth/auth.controller.ts`
   - Function: `register()`

6. **Update auth middleware** — read token from cookie instead of Authorization header
   - File: `packages/backend/src/shared/middleware/auth.ts`
   - Function: `authenticate()` — check `req.cookies.token` first, fallback to Bearer header

7. **Add logout endpoint** — clear cookie on logout
   - File: `packages/backend/src/modules/auth/auth.controller.ts`
   - File: `packages/backend/src/modules/auth/auth.routes.ts`
   - Create `POST /auth/logout` using `res.clearCookie()`

8. **Add cookie config constants** — centralize cookie options
   - File: `packages/backend/src/config/index.ts`
   - Add: `cookieMaxAge`, `cookieSecure`, `cookieSameSite`

### Phase 2: Frontend Changes

9. **Update axios client** — enable `withCredentials` to send cookies
   - File: `packages/frontend/src/api/client.ts`
   - Add `withCredentials: true` to axios config

10. **Remove token from interceptor** — no longer need Bearer header
    - File: `packages/frontend/src/api/client.ts`
    - Remove request interceptor that sets Authorization header

11. **Update Redux authSlice** — remove token from state
    - File: `packages/frontend/src/store/authSlice.ts`
    - Remove `token` from state, remove localStorage get/set for token
    - Keep `user` and `isAuthenticated`

12. **Update useAuth hooks** — adjust login/register handlers
    - File: `packages/frontend/src/hooks/useAuth.ts`
    - `setCredentials` only receives `user`, not `token`

13. **Add logout API call** — call backend to clear cookie
    - File: `packages/frontend/src/api/auth.ts`
    - Add `logout()` function POST to `/auth/logout`

14. **Update useLogout hook** — call API before clearing state
    - File: `packages/frontend/src/hooks/useAuth.ts`
    - Call `authApi.logout()` before dispatch

### Phase 3: Type Updates

15. **Update backend types** — AuthResponse no longer contains token
    - File: `packages/backend/src/modules/auth/auth.types.ts`

16. **Update frontend types** (if any explicit AuthResponse type)
    - File: `packages/frontend/src/api/auth.ts`

---

## Relevant Files

**Backend:**

- `packages/backend/package.json` — add cookie-parser dependency
- `packages/backend/src/app.ts` — CORS config, cookie-parser middleware
- `packages/backend/src/config/index.ts` — cookie configuration constants
- `packages/backend/src/modules/auth/auth.controller.ts` — set/clear cookies
- `packages/backend/src/modules/auth/auth.routes.ts` — add logout route
- `packages/backend/src/shared/middleware/auth.ts` — read token from cookie

**Frontend:**

- `packages/frontend/src/api/client.ts` — withCredentials, remove Bearer interceptor
- `packages/frontend/src/api/auth.ts` — add logout API
- `packages/frontend/src/store/authSlice.ts` — remove token from state
- `packages/frontend/src/hooks/useAuth.ts` — update credentials handling

---

## Verification

1. **Backend tests**: Run `yarn test` — update test cases to mock cookies
2. **Manual test login**: Login → check Response Headers for `Set-Cookie` with `HttpOnly` flag
3. **Manual test protected route**: Call `/auth/me` → verify cookie is sent and auth succeeds
4. **Manual test logout**: Logout → cookie is cleared → `/auth/me` returns 401
5. **Browser DevTools**: Application → Cookies → verify token cookie has correct flags
6. **XSS test**: `document.cookie` cannot read auth token (httpOnly)

---

## Decisions

- **Cookie name**: `token`
- **Cookie options**:
  - `httpOnly: true` — not accessible from JS
  - `secure: true` (production) / `false` (dev) — HTTPS only
  - `sameSite: 'lax'` — basic CSRF protection
  - `maxAge`: match JWT expiry (24h = 86400000ms)
- **Backward compatibility**: Auth middleware checks both cookie and Bearer header

---

## Further Considerations

1. **Refresh Token** — Currently only access token exists. Implement refresh token flow? Option A: Single token (current) / Option B: Access + Refresh token pair
