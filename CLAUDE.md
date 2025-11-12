# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 e-commerce application with user management, role-based access control, and MongoDB database. Uses App Router with Server Components, iron-session for authentication, and Prisma for ORM.

## Development Commands

```bash
# Development server (runs on port 3010)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Database operations (MongoDB via Prisma)
npx prisma generate     # Generate Prisma client after schema changes
npx prisma db push      # Push schema changes to MongoDB
npx prisma studio       # Open Prisma Studio GUI
```

## Core Architecture

### Directory Structure

```
app/
├── Util/constants/        # Session, paths, constants
├── View/Component/        # Reusable React components
├── admin/management/      # Admin dashboard pages
├── api/                   # Route Handlers (REST API)
├── auth/                  # Server actions for login/logout
├── busniessLogic/         # Zod schemas + React Query hooks
└── services/              # Database access layer
```

### Authentication Flow

**Session Management**: `/app/Util/constants/session.ts`
- Uses iron-session with HTTP-only cookies (7-day maxAge)
- Session stores minimal data: `IdAndRole` type (userId, name, role)
- Key functions:
  - `getSession()` - Retrieves current session
  - `getCredential()` - Returns typed `Credential` class or null
  - `requireAuth()` - Throws if not authenticated
  - `hasRole(role)` / `hasAnyRole([roles])` - Role checking
  - `createSession(user)` - Saves user to session
  - `deleteSession()` - Destroys session

**Login**: Server action at `/app/auth/login.tsx`
- Validates username/password against `Login` table
- Uses bcrypt for password comparison
- Calls `createSession()` on success

**Logout**: Server action at `/app/auth/logout.tsx`
- Calls `deleteSession()`

**Client-side Auth**: `/app/auth/context.tsx`
- `AuthProvider` wraps app, receives user from server layout
- `useAuth()` hook provides `{user, isPending}`

### Three-Layer Access Control

1. **Middleware** (`/proxy.ts`):
   - Runs before all page requests (configured via `matcher`)
   - Checks `PROTECTED_ROUTES` object for role requirements
   - Redirects to login if not authenticated
   - Redirects to unauthorized page if wrong role
   - Example: `/admin` requires `[Role.ADMIN, Role.ROOT]`

2. **API Route Guards**:
   - Every route checks auth with `getCredential()` or `hasAnyRole()`
   - Throws error or returns 403 if unauthorized
   - See `/app/api/admin/user/route.tsx` for pattern

3. **Client Components**: `/app/View/Component/RoleGuardComponent.tsx`
   - Prevents rendering protected content
   - Shows fallback UI if unauthorized
   - Usage: `<RoleGuardComponent roles={[Role.ADMIN]}>...</RoleGuardComponent>`

### Database Layer

**Prisma Schema**: `/prisma/schema.prisma`
- MongoDB provider, ObjectId primary keys
- Key models:
  - `User` - User profile (email, name, role, etc.)
  - `Login` - Credentials (username, hashed password, separate from User)
  - `Product` / `ProductDetailView` - E-commerce products
  - `Issue` - Support tickets
  - `Address` - Shipping addresses

**Important Types**:
- `IdAndRole` - Embedded type for user tracking (userId, name, role)
- `Role` enum - `USER`, `CUSTOMER`, `ADMIN`, `ROOT`

**Service Layer Pattern**: `/app/services/UserService.ts`
- All database operations go through services
- Functions accept `Credential` as parameter (never implicit)
- Throws custom errors (e.g., `UserCreationError`) with field names
- Example functions:
  - `findUserById(userId)`
  - `getAllUsersExceptId(cred)`
  - `createUserByAdmin(bean, createdBy)`

**Singleton Client**: `/prisma/client.ts`
- Prevents multiple Prisma instances in development
- Import from here, not `@prisma/client`

### API Routes (Route Handlers)

**Structure**: `/app/api/[module]/[resource]/[action]/route.tsx`

**Pattern**:
```typescript
export async function GET(request: NextRequest) {
    // 1. Get credential
    const cred = await getCredential();

    // 2. Check authorization
    if (!await hasAnyRole([Role.ADMIN, Role.ROOT])) {
        return NextResponse.json({error: "Access denied"}, {status: 403});
    }

    // 3. Call service function
    try {
        const data = await serviceFunction(cred!);
        return NextResponse.json(data, {status: 200});
    } catch (error) {
        return NextResponse.json(
            {error: (error as Error).message},
            {status: 400}
        );
    }
}
```

**Error Handling**:
- Catch `UserCreationError` and format as Zod error
- Use `makeZodError(field, message)` from `/app/Util/zodUtil.ts`
- Return field-specific errors for form validation

### Form Handling

**Validation**: Zod schemas in `/app/busniessLogic/User/userValidation.tsx`
- `baseUserFieldsSchema` - Common fields (username, email, password)
- `adminAddUserSchema` - Admin creates user (extends base, adds firstName, lastName, phone, role)
- `createUserSchema` - Self-registration (adds confirmPassword with cross-field validation)
- `userLoginValidationSchema` - Login form

**Environment-Aware Validation**:
- Password strength differs in dev vs production
- Check `process.env.NEXT_PUBLIC_ENVIRONMENT === "development"`

**Generic Form Wrapper**: `/app/View/Component/GenericFormWrapper.tsx`
- Reusable form component with:
  - Zod validation via `zodResolver`
  - Confirmation modal before submit
  - Loading states
  - Error/success notifications
- Usage: Pass `useForm` methods and `onSubmit` handler

**Notifications**: `/app/Util/toast.tsx`
- `useToastNotifications()` hook for manual state management
- Shows errors and success messages (3-second auto-hide)

### State Management

**React Query**: TanStack Query 5.90
- Provider in `/app/Util/QueryClientProvider.tsx`
- Query hooks in `/app/busniessLogic/User/userManager.ts`
- Example:
  ```typescript
  const { data, isLoading } = useGetAllUsers();
  const mutation = useCreateUser();
  ```
- Cache invalidation pattern:
  ```typescript
  queryClient.invalidateQueries({queryKey: [GET_ALL_USERS_QUERY_KEY]})
  ```

**Query Keys**: Defined in manager files (e.g., `GET_ALL_USERS_QUERY_KEY`)

### Path Management

**Centralized Constants**: `/app/Util/constants/paths.ts`
- Defines all routes in one place
- Structure: `{ VIEW: "/path", API: "/api/path" }`
- Example: `ADMIN_MANAGEMENTS.USERS.VIEW` and `ADMIN_MANAGEMENTS.USERS.API`
- Always import from here, never hardcode URLs

## Key Patterns and Conventions

### Server vs Client Components
- Root layout is Server Component (fetches session)
- Providers (QueryClient, Auth) are Client Components
- Pages are Client Components when interactive
- Use `'use server'` for server actions (login, logout)

### Passing Credentials
- Always pass `Credential` or `IdAndRole` explicitly to services
- Never rely on implicit user detection in service layer
- Enables audit trail (`createdBy` field in models)

### Error Handling
1. Services throw custom errors with field names
2. API routes catch and format as Zod errors
3. Forms display field-specific errors
4. Use `makeZodError()` utility for consistency

### Adding New Features

**New API Endpoint**:
1. Create route handler in `/app/api/[module]/[resource]/route.tsx`
2. Check auth with `getCredential()` or `hasAnyRole()`
3. Call service function
4. Return JSON with appropriate status code

**New Service Function**:
1. Add to appropriate service file (e.g., `UserService.ts`)
2. Accept `Credential` as first parameter
3. Perform database operations via Prisma
4. Throw custom errors with field names

**New Validation Schema**:
1. Add to `/app/busniessLogic/User/userValidation.tsx`
2. Use `.refine()` for cross-field validation
3. Consider environment-specific rules

**New React Query Hook**:
1. Add to appropriate manager file
2. Use query keys for caching
3. Invalidate queries after mutations

**New Protected Route**:
1. Add to `PROTECTED_ROUTES` in `/proxy.ts`
2. Specify required roles array
3. Use `RoleGuardComponent` on client-side components

## Important Notes

- **Spelling**: The directory is named `busniessLogic/` (note spelling)
- **Port**: Dev server runs on port 3010 (not default 3000)
- **Middleware Export**: Middleware function is named `proxy`, not `middleware`
- **MongoDB ObjectId**: Use `@db.ObjectId` and `@map("_id")` in Prisma schema
- **Prisma Client**: Always import from `/prisma/client.ts`, not `@prisma/client`
- **Session Secret**: Required in `.env` as `SESSION_SECRET`
- **Password Hashing**: Uses bcryptjs (salt rounds typically 10)
- **ROOT Role**: Cannot be assigned via schemas (validation prevents it)

## Environment Variables

Required in `.env`:
```
DATABASE_URL=mongodb://localhost:27018/thitserdb
SESSION_SECRET=<generate with crypto.randomBytes(32).toString('base64')>
NEXT_PUBLIC_ENVIRONMENT=development
S3_BUCKET_NAME=<for product images>
S3_ACCESS_KEY=<for product images>
S3_SECRET_ACCESS_KEY=<for product images>
S3_REGION=<for product images>
```

## TypeScript Configuration

- Path alias: `@/*` points to root directory
- Strict mode enabled
- Target ES2017
- Use `@/` imports for absolute paths

## Testing Auth Flow Locally

1. Start dev server: `npm run dev`
2. Visit http://localhost:3010/View/signUp
3. Create user account (password requirements differ by environment)
4. Login at http://localhost:3010/View/login
5. Admin features require seeding ROOT/ADMIN user manually in database
