import { useState } from 'react'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<'logged_in' | 'logged_out' | 'loading'>('loading')

    return <>
        { children }
    </>
}