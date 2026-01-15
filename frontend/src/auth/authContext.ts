import { createContext, useContext } from 'react'

type AuthContextType = {
    status: 'logged_in' | 'logged_out' | 'loading',
    login: () => void,
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
