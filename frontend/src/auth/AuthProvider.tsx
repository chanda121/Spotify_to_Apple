import { useState, useEffect } from 'react'
import { AuthContext } from './authContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<'logged_in' | 'logged_out' | 'loading'>('loading')

    const logout = () => {
        fetch('/api/auth/logout')
        setStatus('logged_out')
        window.location.href = 'http://127.0.0.1:5173/'
    }

    const login = () => {
        window.location.href = '/api/auth'
    }
    //set status here
    useEffect( () => {

        const check_session = async () => {
            const response = await fetch('/api/user/session')
            const data = await response.json()
            if (data.logged_in) {
                setStatus('logged_in')
            } else {
                setStatus('logged_out')
            }
        }
        check_session()

        window.addEventListener('focus', check_session)
        return () => {
            window.removeEventListener('focus', check_session)
        }
    }, [])

    return <AuthContext.Provider value={ {status, login, logout} }>
        { children }
    </AuthContext.Provider>
}