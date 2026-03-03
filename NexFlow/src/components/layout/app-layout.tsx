import { Outlet } from 'react-router-dom'
import Sidebar from './sidebar'

/**
 * Main layout shell: fixed sidebar + scrollable content area.
 * Wraps all authenticated routes via React Router's `<Outlet />`.
 */
function AppLayout() {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="ml-60 flex-1 p-6">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout
