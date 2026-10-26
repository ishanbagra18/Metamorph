# 🦋 Metamorph Frontend

Production-quality React 18 single-page application for **Metamorph: Autonomous JavaScript → TypeScript Migration Agent**.

---

## 🚀 Quick Setup & Run

### 1. Prerequisites
- **Node.js**: v18.0.0+
- **npm**: v9.0.0+
- **Backend**: FastAPI backend running at `http://localhost:8000` (via `start.bat` or `python -m uvicorn app.main:app`)

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Environment Variables
Create `.env` from `.env.example`:
```ini
VITE_API_URL=/api
VITE_WS_URL=
```
*(During development, Vite proxies `/api` and `/ws` directly to `http://localhost:8000`)*.

### 4. Run Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 5. Build for Production
```bash
npm run build
```
Generates optimized static assets in `dist/`. The FastAPI backend automatically mounts and serves `frontend/dist` at `http://localhost:8000/`.

---

## 🗺️ Application Routes

### Public Routes (PublicLayout)
| Route | Component | Purpose |
| :--- | :--- | :--- |
| `/` | `LandingPage.jsx` | Hero with CTA, interactive 4-phase architectural walkthrough, before/after code diff preview, pricing tiers, and FAQ |
| `/login` | `LoginPage.jsx` | Sign in form with password toggle, demo credential buttons (`admin@metamorph.dev`, `alice@example.com`) |
| `/register` | `RegisterPage.jsx` | User registration with dynamic password strength meter, terms consent, and auto-login |
| `/forgot-password` | `ForgotPasswordPage.jsx` | Password reset request; outputs test token for easy local verification |
| `/reset-password/:token` | `ResetPasswordPage.jsx` | Password confirmation and reset form |
| `/verify-email` | `VerifyEmailPage.jsx` | Verification status notification |
| `/404` | `NotFoundPage.jsx` | Global 404 error page |

### Protected Routes (DashboardLayout, requires authentication)
| Route | Component | Purpose |
| :--- | :--- | :--- |
| `/dashboard` | `DashboardPage.jsx` | Cluster metrics, recent migrations table, conversion progress bars, engine hardware status |
| `/migrations` | `MigrationsListPage.jsx` | Searchable, paginated repository migration history with status filters (All, Active, Completed, Failed, Ready) |
| `/migrations/:id` | `MigrationDetailPage.jsx` | Workspace detail view: Topological DAG (`DepGraphView`), Code Diff & Compiler Diagnostic Ladder (`DiffViewer`), Live WebSocket Console (`TerminalView`), Quality Audit Score (`QualityScoreMeter`) |
| `/profile` | `ProfilePage.jsx` | Personal profile information, avatar randomizer, and company details |
| `/settings` | `SettingsPage.jsx` | Change password form, Obsidian Dark / Daylight Slate theme switcher, account deletion |

### Admin Routes (Role-Restricted, requires `role === 'admin'`)
| Route | Component | Purpose |
| :--- | :--- | :--- |
| `/admin/dashboard` | `AdminDashboardPage.jsx` | Global cluster throughput, total users, conversion success rate, hardware/LLM specs |
| `/admin/users` | `AdminUsersPage.jsx` | User governance directory, promote to admin / demote to user, delete user accounts |

---

## 🔐 Authentication & Session Flow

1. **Tokens**:
   - **Access Token**: JWT containing `sub=user_id`, `email`, and `role`, valid for 120 minutes. Stored in memory with `localStorage` backup for page refresh resilience.
   - **Refresh Token**: HTTP-only cookie (`samesite=lax`), valid for 7 days.
2. **Auto-Refresh**:
   - The centralized `apiClient` (`lib/api/client.js`) intercepts any `401 Unauthorized` response.
   - It silently requests `/api/auth/refresh`, updates the in-memory token, and replays the original queued request seamlessly without disrupting the user.
3. **Route Guards**:
   - `ProtectedRoute`: Verifies `isAuthenticated`; redirects unauthenticated requests to `/login` preserving the return URL in navigation state.
   - `RoleRoute`: Verifies `user.role === 'admin'`; redirects non-admin users to `/dashboard`.
   - `PublicOnlyRoute`: Prevents logged-in users from seeing login/register forms, redirecting them straight to `/dashboard`.

---

## 📁 Folder Structure

```
frontend/
├── dist/                          # Production compiled bundle (served by FastAPI)
├── src/
│   ├── components/
│   │   ├── features/              # Complex domain features
│   │   │   ├── CreateRunModal.jsx # Drag & drop ZIP upload & Git clone modal
│   │   │   ├── DepGraphView.jsx   # Visual topological DAG & cycle visualizer
│   │   │   ├── DiffViewer.jsx     # Side-by-side JS vs strict TS diff viewer
│   │   │   ├── QualityScoreMeter.jsx # Radial quality score meter & audit breakdown
│   │   │   └── TerminalView.jsx   # Live streaming WebSocket log console
│   │   ├── guards/                # Route security guards
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── PublicOnlyRoute.jsx
│   │   │   └── RoleRoute.jsx
│   │   ├── layout/                # Responsive layout wrappers
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── DashboardSidebar.jsx
│   │   │   ├── DashboardTopbar.jsx
│   │   │   ├── PublicFooter.jsx
│   │   │   ├── PublicLayout.jsx
│   │   │   └── PublicNavbar.jsx
│   │   └── ui/                    # Reusable design system primitives
│   │       ├── Badge.jsx
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── ConfirmDialog.jsx
│   │       ├── Input.jsx
│   │       ├── Modal.jsx
│   │       ├── ProgressBar.jsx
│   │       └── Skeleton.jsx
│   ├── context/                   # Global React contexts
│   │   ├── AuthContext.jsx        # User state, login, register, session
│   │   ├── ThemeContext.jsx       # Dark/Light mode switcher with persistence
│   │   └── ToastContext.jsx       # Non-intrusive floating toasts
│   ├── lib/
│   │   └── api/                   # Typed API communication modules
│   │       ├── admin.js
│   │       ├── auth.js
│   │       ├── client.js          # Fetch client with 401 token refresh interceptor
│   │       └── migrations.js
│   ├── pages/
│   │   ├── protected/             # Dashboard, Migrations, Detail, Profile, Settings, Admin
│   │   └── public/                # Landing, Login, Register, Forgot Password, 404
│   ├── types/                     # Type definitions and JSDoc contracts
│   ├── App.jsx                    # Primary application router
│   ├── index.css                  # Modern Obsidian theme & CSS variables
│   └── main.jsx                   # React 18 DOM mount point
├── index.html
├── package.json
└── vite.config.js
```
