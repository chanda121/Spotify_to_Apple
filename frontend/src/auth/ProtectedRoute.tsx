import { useAuth } from './authContext'
import { Navigate } from 'react-router-dom'

export const ProtectedRoute = ( {children}: {children: React.ReactNode} ) => {
    const { status } = useAuth()

    if (status === 'loading') return <div>loading...</div>
    if (status === 'logged_out') return <Navigate to='/' />

    return children
}   