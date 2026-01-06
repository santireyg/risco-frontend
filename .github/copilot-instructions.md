# Risco IA - Frontend Development Guide

## Project Overview

**Risco IA** is a Next.js 15 financial risk analysis application that processes financial documents, validates accounting statements, and generates comprehensive risk reports. The app features real-time document processing via WebSocket, role-based authentication (user/admin/superadmin), and interactive financial visualizations.

**Tech Stack**: Next.js 15 (App Router), TypeScript, HeroUI v2, Tailwind CSS, Recharts, WebSocket

## Architecture Patterns

### Routing & Organization

- **App Router Structure**: Feature-based routing in `app/` directory
  - Routes: `/home`, `/login`, `/admin`, `/profile`, `/upload`, `/document/[docfile_id]`, `/reporte`, `/auth/*`
  - Root redirects permanently to `/home` (see [next.config.js](next.config.js))
  - Page components must use `"use client"` directive for interactivity

### State Management & Context

**Two global contexts wrap the entire app** (order matters):

1. **AuthContext** ([app/context/AuthContext.tsx](app/context/AuthContext.tsx)) - Session management
   - Provides: `user`, `isLoading`, `logout`, `checkSession`, `updateUserProfile`
   - Calls `GET /me` on mount to verify session (silent mode to avoid 401 noise)
   - Never redirect from context - let pages handle auth routing
2. **WebSocketContext** ([app/context/WebSocketContext.tsx](app/context/WebSocketContext.tsx)) - Real-time updates
   - Connects to `${NEXT_PUBLIC_API_BASE_URL}/ws` with auto-reconnect
   - Provides: `docUpdates` (Record<docId, DocUpdate>), `isConnected`, `lastMessage`
   - Document components subscribe to updates by document ID

**Layout structure** ([app/layout.tsx](app/layout.tsx)):

```tsx
<AuthProvider>
  <WebSocketProvider>
    <HeroUIProvider>
      <NavBar />
      {children}
```

### API Communication

**Centralized client** ([app/lib/apiClient.ts](app/lib/apiClient.ts)):

- Base URL: `NEXT_PUBLIC_API_BASE_URL` environment variable (required)
- **Automatic CSRF protection**: Reads `csrf_token` cookie, injects `X-CSRF-Token` header on POST/PUT/DELETE
- **Credentials**: Always `include` for cookie-based sessions
- **Error handling**: Custom `ApiError` class with status/body
- **Silent mode**: Pass `{ silent: true }` to suppress error logs (useful for session checks)

**Usage pattern**:

```typescript
import { api } from "@/app/lib/apiClient";

const data = await api.get<ResponseType>("endpoint");
const result = await api.post("endpoint", body);
```

### Custom Hooks Pattern

**Location**: Co-located with features in `app/[feature]/hooks/`

**Standard structure**:

```typescript
export function useDocuments(params: { page: number /* ... */ }) {
  const [data, setData] = useState<ResponseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => {
      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const result = await api.get<ResponseType>(/* ... */);
          setData(result);
        } catch (e) {
          setError(e.message);
          if (e instanceof ApiError && e.status === 401) {
            router.push("/login"); // Handle auth errors in hooks
          }
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    },
    [
      /* dependencies */
    ]
  );

  return { data, loading, error };
}
```

**Examples**: [useDocuments.ts](app/home/hooks/useDocuments.ts), [useRegistration.ts](app/auth/hooks/useRegistration.ts)

## Key Development Patterns

### Component Organization

**Pages** (`page.tsx`):

- Orchestrate layout and data fetching
- Handle authentication checks
- Pass data to domain components

**Components** (`components/`):

- Co-located with pages/features they serve
- Shared components in root `components/` (e.g., NavBar, StatusChip)
- Presentational components don't fetch data directly

**Utils** (`utils/`):

- Business logic, calculations, formatting
- Example: [calculations.ts](app/reporte/utils/calculations.ts) - KPI computations with trend analysis

### Type Definitions

**Domain types**: Co-located with features (e.g., [app/reporte/types.ts](app/reporte/types.ts))

**Common patterns**:

```typescript
// MongoDB ID/Date wrappers from backend
interface MongoId {
  $oid: string;
}
interface MongoDate {
  $date: string;
}

// Status types with strict unions
type KPIStatus = "excelente" | "admisible" | "deficiente";
type KPITrend = "up" | "down" | "neutral";
```

### Validation & Forms

**Centralized validation** ([app/auth/utils/validations.ts](app/auth/utils/validations.ts)):

```typescript
export interface ValidationRule {
  pattern?: RegExp;
  minLength?: number;
  message: string;
  validator?: (value: string) => boolean;
}

// Rules enforce: no personal emails, password strength (8+ chars, upper/lower/digit)
```

**Form pattern**: Real-time validation, disabled submit until valid, HeroUI components

### Logging

**Logger utility** ([app/lib/logger.ts](app/lib/logger.ts)):

- `logger.debug/info/warn/error`
- Auto-suppresses debug/info in production
- Always shows errors/warnings

### Role-Based Access

**Roles**: `"user" | "admin" | "superadmin"`

**Pattern**:

```tsx
const { user } = useContext(AuthContext);
if (user?.role === "admin" || user?.role === "superadmin") {
  // Show admin features
}
```

**Admin panel**: [app/admin/page.tsx](app/admin/page.tsx) - User management table with pending approvals

## Development Workflow

### Commands

```bash
pnpm dev              # Dev server with Turbopack
pnpm build            # Production build (required to pass before deploy)
pnpm start            # Production server preview
pnpm lint             # ESLint with auto-fix
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000  # Required, no trailing slash
```

### Code Quality

- **ESLint**: Must pass `pnpm build` with zero errors (warnings acceptable)
- **TypeScript**: Strict mode enabled, no implicit any
- **Accessibility**: jsx-a11y enforced (labels must have associated controls)
- **Next.js Image**: Use `<Image>` from `next/image`, not `<img>`
- **Import order**: React → Next → External → Internal → Styles

## Financial Calculations (Reporte Module)

**Location**: [app/reporte/](app/reporte/)

**Key functions** ([utils/calculations.ts](app/reporte/utils/calculations.ts)):

- `calculateCapitalTrabajo`: Working capital with trends (activoCorriente - pasivoCorriente)
- `calculateAllKPIs`: Financial ratios with status thresholds
  - Liquidity: `[1, 1.5]` for "admisible" to "excelente"
  - Solvency: `[0.5, 1]`
  - Profitability: `[0.05, 0.1]` (5-10%)
  - Inverse metrics (endeudamiento): Lower is better

**KPI structure**:

```typescript
interface KPI {
  label: string;
  value: number;
  status: "excelente" | "admisible" | "deficiente";
  comparison: {
    value: number; // Previous period value
    trend: "up" | "down" | "neutral";
    difference: number; // Percentage point change
  };
  criteria: { min: number; max: number };
}
```

**Trend logic**: `getTrend(current, previous, inverse)` - Some metrics improve when decreasing (debt ratios)

## Common Gotchas

1. **"use client" directive**: Required for any component using hooks, context, or event handlers
2. **CSRF token**: Automatically handled by apiClient - don't manually set headers
3. **Session checks**: Use `{ silent: true }` on `/me` calls to avoid console spam on 401
4. **WebSocket reconnection**: Built-in with exponential backoff - don't manually reconnect
5. **Date formatting**: Backend sends MongoDB dates as `{ $date: "ISO_STRING" }` - use `formatDate()` from [utils/formatting.ts](app/reporte/utils/formatting.ts)
6. **Path aliases**: Use `@/` prefix (resolves to project root) - configured in [tsconfig.json](tsconfig.json)
7. **HeroUI theming**: Components auto-adapt to dark mode via `next-themes` - no manual toggle needed

## Testing Auth Flows

1. **Registration** → Email verification → Pending approval (admin action) → Active
2. **Password reset**: Forgot password → Email link → Reset form (token validation)
3. **Session persistence**: Cookies (`csrf_token`, session) auto-sent via `credentials: include`

## Deployment (Vercel)

**Build requirements** (see [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)):

- Must pass `pnpm build` with zero errors
- Set `NEXT_PUBLIC_API_BASE_URL` in Vercel environment variables
- Framework: Next.js (auto-detected)
- Node version: 20.x (specified in package.json engines if present)

**Pre-deploy checklist**:

- [ ] Build passes locally
- [ ] No TypeScript errors
- [ ] No accessibility violations (jsx-a11y)
- [ ] Environment variables configured

---

_For architecture decisions, see [PRDs/USER_SYSTEM_INTEGRATION.md](PRDs/USER_SYSTEM_INTEGRATION.md). For visual components, reference HeroUI docs at heroui.com._
