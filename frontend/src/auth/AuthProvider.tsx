import { useState, useEffect } from 'react'
import { AuthContext } from './authContext'
import { useSpotifyUserStore } from '../store/useSpotifyUserStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<'loggedIn' | 'loggedOut' | 'loading'>('loading')

    const resetStore = useSpotifyUserStore((state) => state.reset)

    const logout = async (): Promise<void> => {
        await fetch('/api/spotify/auth/logout')
        resetStore() // Clear all cached data
        setStatus('loggedOut')
        window.location.href = 'http://127.0.0.1:5173/'
    }

    const login = () => {
        window.location.href = '/api/spotify/auth'
    }
    const fetchUser = useSpotifyUserStore((state) => state.fetchUser)
    const fetchTopTracks = useSpotifyUserStore((state) => state.fetchTopTracks)
    const fetchTopArtists = useSpotifyUserStore((state) => state.fetchTopArtists)

    //set status here
    useEffect( () => {
        const checkSession = async () => {
            const response = await fetch('/api/spotify/user/session')
            const data = await response.json()
            if (data.loggedIn) {
                setStatus('loggedIn')
            } else {
                resetStore() // Clear stale data when session expires
                setStatus('loggedOut')
            }
        }
        checkSession()

        window.addEventListener('focus', checkSession)
        return () => window.removeEventListener('focus', checkSession)
        
    }, [resetStore])

    // Fetch user data once when logged in
    useEffect(() => {
        if (status === 'loggedIn') {
            void fetchUser()
            void fetchTopTracks()
            void fetchTopArtists()
        }
    }, [status, fetchUser, fetchTopTracks, fetchTopArtists])

    return <AuthContext.Provider value={ {status, login, logout} }>
        { children }
    </AuthContext.Provider>
}