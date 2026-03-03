import { useEffect } from 'react'
import { AuthProvider, useAuth } from 'react-oidc-context'
import type { User } from 'oidc-client-ts'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { store } from '@/store/store'
import { setToken } from '@/store/api/api-slice'
import AppLayout from '@/components/layout/app-layout'
import DashboardPage from '@/pages/dashboard-page'
import ManagedProjectsPage from '@/pages/managed-projects-page'

/**
 * OIDC configuration — reads from Vite env vars.
 * Matches the Keycloak client setup for the pams-web client.
 */
const oidcConfig = {
    authority: import.meta.env.VITE_OIDC_AUTHORITY,
    client_id: import.meta.env.VITE_OIDC_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_OIDC_REDIRECT_URI,
    post_logout_redirect_uri:
        import.meta.env.VITE_OIDC_POST_LOGOUT_REDIRECT_URI,
    scope: 'openid profile email',
    automaticSilentRenew: true,
    onSigninCallback: (_user: User | void) => {
        // Clean up the OIDC callback params from the URL
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
        )
    },
}

/**
 * Inner app content — must be inside AuthProvider to use useAuth().
 * Syncs the OIDC access token into the RTK Query API slice
 * so fetchBaseQuery can inject it into every request.
 *
 * Auth guard: unauthenticated users are redirected to Keycloak login.
 */
function AppContent() {
    const auth = useAuth()

    useEffect(() => {
        setToken(auth.user?.access_token ?? null)
    }, [auth.user?.access_token])

    // Auto-redirect to Keycloak login when not authenticated
    useEffect(() => {
        if (
            !auth.isLoading &&
            !auth.isAuthenticated &&
            !auth.activeNavigator
        ) {
            void auth.signinRedirect()
        }
    }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator])

    if (auth.isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading…</p>
            </div>
        )
    }

    if (auth.error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <p className="text-destructive">
                    Auth error: {auth.error.message}
                </p>
                <button
                    onClick={() => void auth.signinRedirect()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                    Try again
                </button>
            </div>
        )
    }

    if (!auth.isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">
                    Redirecting to login…
                </p>
            </div>
        )
    }

    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />
                <Route
                    path="/dashboard"
                    element={<DashboardPage />}
                />
                <Route
                    path="/managed-projects"
                    element={<ManagedProjectsPage />}
                />
            </Route>
            <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
            />
        </Routes>
    )
}

/**
 * Root application component.
 * Wraps the app in AuthProvider → Redux Provider → BrowserRouter.
 */
function App() {
    return (
        <AuthProvider {...oidcConfig}>
            <Provider store={store}>
                <BrowserRouter>
                    <AppContent />
                </BrowserRouter>
            </Provider>
        </AuthProvider>
    )
}

export default App
