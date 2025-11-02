# Redux Store Documentation

This application uses **Redux Toolkit** for centralized state management.

## Store Structure

```
store/
├── index.ts              # Store configuration and typed hooks
├── ReduxProvider.tsx     # Redux Provider component
└── slices/
    ├── authSlice.ts      # Authentication state
    ├── assetsSlice.ts    # Assets management state
    └── uiSlice.ts        # UI state (theme, notifications, sidebar)
```

## Slices

### Auth Slice (`authSlice.ts`)

Manages user authentication state and API calls.

**State:**
- `user`: Current user object
- `token`: Authentication token
- `isLoading`: Loading state for auth operations
- `isAuthenticated`: Boolean indicating if user is logged in
- `error`: Error message if any

**Async Thunks:**
- `loginUser({ username, password })`: Login with credentials
- `registerUser({ username, email, password })`: Register new user
- `fetchCurrentUser()`: Fetch current user from token

**Actions:**
- `logout()`: Clear auth state and remove token
- `clearError()`: Clear error message

### Assets Slice (`assetsSlice.ts`)

Manages assets data and filtering.

**State:**
- `assets`: Array of assets
- `currentAsset`: Currently selected asset
- `isLoading`: Loading state
- `error`: Error message
- `totalCount`: Total number of assets
- `currentPage`: Current pagination page
- `pageSize`: Items per page
- `searchQuery`: Current search query
- `filters`: Applied filters

**Async Thunks:**
- `fetchAssets({ page, pageSize, search, filters })`: Fetch assets list
- `fetchAssetById(assetId)`: Fetch single asset
- `deleteAsset(assetId)`: Delete an asset

**Actions:**
- `setSearchQuery(query)`: Update search query
- `setFilters(filters)`: Update filters
- `setCurrentPage(page)`: Change pagination page
- `clearCurrentAsset()`: Clear selected asset
- `clearError()`: Clear error message

### UI Slice (`uiSlice.ts`)

Manages UI state including theme and notifications.

**State:**
- `colorMode`: 'light' or 'dark'
- `sidebarOpen`: Boolean for sidebar state
- `notifications`: Array of notification objects

**Actions:**
- `setColorMode(mode)`: Set color mode
- `toggleColorMode()`: Toggle between light and dark
- `toggleSidebar()`: Toggle sidebar open/close
- `setSidebarOpen(open)`: Set sidebar state
- `addNotification({ type, message })`: Add notification
- `removeNotification(id)`: Remove notification by ID
- `clearNotifications()`: Clear all notifications
- `initializeColorMode()`: Load color mode from localStorage

## Usage

### Using Typed Hooks

```typescript
import { useAppDispatch, useAppSelector } from '@/store'

function MyComponent() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  // Use dispatch and selector...
}
```

### Using Custom Hooks

#### Auth Hook

```typescript
import { useReduxAuth } from '@/hooks/useReduxAuth'

function LoginComponent() {
  const { user, isLoading, error, login, logout } = useReduxAuth()

  const handleLogin = async () => {
    await login('username', 'password')
  }

  return (
    // Component JSX...
  )
}
```

#### Assets Hook

```typescript
import { useReduxAssets } from '@/hooks/useReduxAssets'

function AssetsComponent() {
  const {
    assets,
    isLoading,
    loadAssets,
    removeAsset
  } = useReduxAssets()

  useEffect(() => {
    loadAssets({ page: 1, pageSize: 20 })
  }, [])

  return (
    // Component JSX...
  )
}
```

## Integration

Redux is integrated into the app through the `ReduxProvider` in `app/providers.tsx`:

```typescript
<ReduxProvider>
  <QueryClientProvider>
    <ChakraProvider>
      {/* Other providers */}
    </ChakraProvider>
  </QueryClientProvider>
</ReduxProvider>
```

## Features

### ✅ Type Safety
- Fully typed with TypeScript
- Type inference for state and dispatch
- Typed custom hooks

### ✅ DevTools Support
- Redux DevTools enabled by default in development
- Time-travel debugging
- Action inspection

### ✅ Persistence
- Auth token persists to localStorage
- Color mode persists to localStorage
- Auto-rehydration on app load

### ✅ Error Handling
- Centralized error states in each slice
- Clear error actions available
- Rejection handling in async thunks

### ✅ Async Operations
- Built-in loading states
- Thunks for API calls
- Automatic request deduplication

## Best Practices

1. **Use custom hooks** (`useReduxAuth`, `useReduxAssets`) for cleaner component code
2. **Clear errors** after handling them to prevent stale error states
3. **Use selectors** to access only the state you need
4. **Dispatch actions** through the typed `useAppDispatch` hook
5. **Handle loading states** appropriately in UI

## Migration from Context API

The existing `AuthContext` and `ColorModeContext` now use Redux internally but maintain their original API for backward compatibility. New components should use the Redux hooks directly.
