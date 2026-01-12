import { createContext } from 'react'

type AuthContextType = {
    status: 'logged_in' | 'logged_out' | 'loading',
    login: () => void,
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

